"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { OrderState, ChatResponsePayload, PastryItem } from "@/types/order";
import { itemPrice, itemLabel, pastryUnitPrice } from "@/lib/pricing";
import {
  IconMic,
  IconSpeaker,
  IconSpeakerOff,
  IconStop,
  IconWarning,
  IconCoffee,
  IconTea,
  IconPastry,
} from "@/app/Icons";
import "./customer.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Hey! Welcome to Spill the Beans. What can I get started for you?";

/* ══════════════════════════════════════
   Menu data (compact reference for chat)
   ══════════════════════════════════════ */

const MENU = {
  coffee: [
    { name: "Americano", small: 3.0, large: 4.0 },
    { name: "Latte", small: 4.0, large: 5.0 },
    { name: "Cappuccino", small: 4.0, large: 5.0 },
    { name: "Cold Brew", small: 4.0, large: 5.0 },
    { name: "Mocha", small: 4.5, large: 5.5 },
    { name: "Frappuccino", small: 5.5, large: 6.0 },
  ],
  tea: [
    { name: "Black Tea", small: 3.0, large: 3.75 },
    { name: "Jasmine Tea", small: 3.0, large: 3.75 },
    { name: "Lemon Green Tea", small: 3.5, large: 4.25 },
    { name: "Matcha Latte", small: 4.5, large: 5.25 },
  ],
  pastries: [
    { name: "Plain Croissant", price: 3.5 },
    { name: "Chocolate Croissant", price: 4.0 },
    { name: "Choc Chip Cookie", price: 2.5 },
    { name: "Banana Bread", price: 3.0 },
  ],
};

/* ══════════════════════════════════════
   TTS helper — ElevenLabs with fallback
   to browser SpeechSynthesis
   ══════════════════════════════════════ */

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

function cancelTts() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  if (typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }
}

function speakBrowser(text: string, rate = 1.1): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = 1;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

async function speakAsync(text: string): Promise<void> {
  cancelTts();
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`TTS API ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    currentObjectUrl = url;
    return new Promise<void>((resolve) => {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentObjectUrl = null;
        currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        currentObjectUrl = null;
        currentAudio = null;
        resolve();
      };
      audio.play().catch(() => {
        URL.revokeObjectURL(url);
        currentObjectUrl = null;
        currentAudio = null;
        speakBrowser(text).then(resolve);
      });
    });
  } catch {
    return speakBrowser(text);
  }
}

/* ══════════════════════════════════════
   Component
   ══════════════════════════════════════ */

interface ChatInterfaceProps {
  onOrderUpdate?: (state: OrderState) => void;
}

export default function ChatInterface({ onOrderUpdate }: ChatInterfaceProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [orderState, setOrderState] = useState<OrderState>({ items: [] });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [micStatus, setMicStatus] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Refs so callbacks always read the latest state
  const messagesRef = useRef(messages);
  const orderStateRef = useRef(orderState);
  const ttsEnabledRef = useRef(ttsEnabled);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { orderStateRef.current = orderState; }, [orderState]);
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);

  // Notify parent of order state changes
  useEffect(() => { onOrderUpdate?.(orderState); }, [orderState, onOrderUpdate]);

  // Scroll to bottom on any update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, input, micStatus]);

  /* ── Send message to API ── */
  const sendMessage = useCallback(
    async (
      userText: string,
      currentMessages: Message[],
      currentOrderState: OrderState
    ) => {
      const userMsg: Message = { role: "user", content: userText.trim() };
      const updated = [...currentMessages, userMsg];

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updated, currentOrderState }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Chat request failed");
        }
        const payload: ChatResponsePayload = await res.json();
        const assistantMsg: Message = {
          role: "assistant",
          content: payload.assistantMessage,
        };
        return { payload, newMessages: [...updated, assistantMsg] };
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        const errReply: Message = {
          role: "assistant",
          content: `Sorry, something went wrong — ${errMsg}. Try again?`,
        };
        console.error("Chat error:", err);
        return { payload: null, newMessages: [...updated, errReply] };
      }
    },
    []
  );

  /* ── Handle send (reads latest state from refs) ── */
  const handleSend = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;
      setInput("");
      setMicStatus(null);

      const currentMessages = messagesRef.current;
      const currentOrderState = orderStateRef.current;

      const userMsg: Message = { role: "user", content: userText.trim() };
      const updatedMessages = [...currentMessages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);

      const { payload, newMessages } = await sendMessage(
        userText,
        currentMessages,
        currentOrderState
      );
      setMessages(newMessages);
      setIsLoading(false);

      if (payload) {
        setOrderState(payload.updatedOrderState);
        if (ttsEnabledRef.current) speakAsync(payload.assistantMessage);

        if (payload.isComplete) {
          setIsComplete(true);
          try {
            const orderRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ payload: payload.updatedOrderState }),
            });
            if (orderRes.ok) {
              const order = await orderRes.json();
              setOrderId(order.id);
            }
          } catch {
            /* ignore */
          }
        }
      }
    },
    [sendMessage]
  );

  /* ══════════════════════════════════════
     Mic: MediaRecorder → Whisper API
     ══════════════════════════════════════ */

  const startRecording = useCallback(async () => {
    if (isRecording || isLoading || isComplete) return;

    cancelTts();
    setMicStatus(null);
    setInput("");

    // Request microphone access
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Mic access error:", err);
      setMicStatus("Mic access denied — check browser & system permissions.");
      return;
    }

    streamRef.current = stream;
    audioChunksRef.current = [];

    // Pick a supported MIME type
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

    const recorder = new MediaRecorder(stream, { mimeType });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      // Release mic
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      const chunks = audioChunksRef.current;
      if (chunks.length === 0) {
        setMicStatus("No audio recorded — try again.");
        return;
      }

      const audioBlob = new Blob(chunks, { type: mimeType });
      audioChunksRef.current = [];

      // Send to Whisper for transcription
      setMicStatus("Transcribing…");
      try {
        const form = new FormData();
        form.append("audio", audioBlob, "recording.webm");

        const res = await fetch("/api/stt", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Transcription failed");
        }

        const { text } = await res.json();
        setMicStatus(null);

        if (!text || !text.trim()) {
          setMicStatus("Couldn't hear anything — try again.");
          return;
        }

        // Show transcript and auto-send
        setInput(text.trim());
        setTimeout(() => handleSend(text.trim()), 300);
      } catch (err) {
        console.error("STT error:", err);
        setMicStatus("Transcription failed — try typing instead.");
      }
    };

    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setLiveTranscript("");
    recorder.start();

    // Start browser SpeechRecognition for live transcript
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          interim += event.results[i][0].transcript;
        }
        setLiveTranscript(interim);
      };
      recognition.onerror = () => { /* ignore — Whisper handles final */ };
      recognition.onend = () => { /* will restart if still recording */ };
      recognitionRef.current = recognition;
      recognition.start();
    }
  }, [isRecording, isLoading, isComplete, handleSend]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setLiveTranscript("");

    // Stop browser speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  }, []);

  /* ── New order reset ── */
  const resetOrder = useCallback(() => {
    cancelTts();
    stopRecording();
    setMessages([{ role: "assistant", content: GREETING }]);
    setOrderState({ items: [] });
    setIsComplete(false);
    setOrderId(null);
    setInput("");
    setMicStatus(null);
  }, [stopRecording]);

  /* ══════════════════════════════════════
     Render
     ══════════════════════════════════════ */
  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <h1>Order</h1>
        <div className="header-controls">
          <button
            className={`mode-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            title="View menu"
          >
            <IconCoffee size={18} />
          </button>
          <button
            className={`mode-toggle ${ttsEnabled ? "active" : ""}`}
            onClick={() => {
              setTtsEnabled((v) => !v);
              if (ttsEnabled) cancelTts();
            }}
            title={ttsEnabled ? "Mute assistant" : "Unmute assistant"}
          >
            {ttsEnabled ? (
              <IconSpeaker size={18} />
            ) : (
              <IconSpeakerOff size={18} />
            )}
          </button>
        </div>
      </header>

      {/* Collapsible menu reference */}
      {menuOpen && (
        <div className="menu-panel">
          <div className="menu-section">
            <h3>
              <IconCoffee size={14} /> Coffee
            </h3>
            <div className="menu-items">
              {MENU.coffee.map((d) => (
                <div key={d.name} className="menu-row">
                  <span className="menu-name">{d.name}</span>
                  <span className="menu-price">
                    ${d.small.toFixed(2)} / ${d.large.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="menu-section">
            <h3>
              <IconTea size={14} /> Tea
            </h3>
            <div className="menu-items">
              {MENU.tea.map((d) => (
                <div key={d.name} className="menu-row">
                  <span className="menu-name">{d.name}</span>
                  <span className="menu-price">
                    ${d.small.toFixed(2)} / ${d.large.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="menu-section">
            <h3>
              <IconPastry size={14} /> Pastries
            </h3>
            <div className="menu-items">
              {MENU.pastries.map((p) => (
                <div key={p.name} className="menu-row">
                  <span className="menu-name">{p.name}</span>
                  <span className="menu-price">${p.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="menu-note">
            Prices: small (12oz) / large (16oz) · Add-ons: oat milk +$0.50,
            almond +$0.75, extra shot +$1.50, syrup +$0.50
          </p>
        </div>
      )}

      {/* Messages — full conversation transcript */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <div className="msg-bubble">{msg.content}</div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="msg assistant">
            <div className="msg-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* Receipt */}
        {isComplete && orderState.items.length > 0 && (
          <div className="receipt">
            <div className="receipt-inner">
              <div className="receipt-header">
                <h3>Spill the Beans</h3>
              </div>
              {orderId && (
                <p className="receipt-id">Order #{orderId.slice(0, 8)}</p>
              )}
              {!orderId && (
                <p className="receipt-error">
                  <IconWarning size={14} /> Order could not be placed — please
                  show this to a barista.
                </p>
              )}
              <ul>
                {orderState.items.map((item, i) => (
                  <li key={i}>
                    <div className="receipt-item-info">
                      <span className="receipt-item-label">
                        {itemLabel(item)}
                      </span>
                      {item.type === "pastry" &&
                        (item as PastryItem).quantity > 1 && (
                          <span className="receipt-item-unit">
                            ${pastryUnitPrice(item as PastryItem).toFixed(2)}{" "}
                            each
                          </span>
                        )}
                    </div>
                    <span className="receipt-item-price">
                      ${itemPrice(item).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="receipt-total">
                <strong>Total</strong>
                <strong>
                  $
                  {orderState.items
                    .reduce((s, it) => s + itemPrice(it), 0)
                    .toFixed(2)}
                </strong>
              </div>
              <p className="receipt-time">
                {new Date().toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <button className="new-order-btn" onClick={resetOrder}>
                New Order
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Unified input bar */}
      {!isComplete && (
        <div className="chat-input-area">
          {/* Mic status feedback */}
          {micStatus && <div className="mic-status">{micStatus}</div>}
          <form
            className="text-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isRecording) handleSend(input);
            }}
          >
            <div
              className={`input-wrapper ${isRecording ? "recording" : ""}`}
            >
              <input
                type="text"
                value={isRecording ? liveTranscript : input}
                onChange={(e) => { if (!isRecording) setInput(e.target.value); }}
                placeholder={
                  isRecording
                    ? "Listening…"
                    : "Type or tap the mic…"
                }
                readOnly={isRecording}
                disabled={isLoading}
              />
              <button
                type="button"
                className={`inline-mic-btn ${isRecording ? "active" : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                title={isRecording ? "Stop recording" : "Speak your order"}
              >
                {isRecording ? (
                  <IconStop size={16} />
                ) : (
                  <IconMic size={16} />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="send-btn"
              disabled={!input.trim() || isLoading || isRecording}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
