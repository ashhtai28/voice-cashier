"use client";

import ChatInterface from "./ChatInterface";
import { IconCoffee, IconTea, IconPastry } from "@/app/Icons";
import "./voice-order.css";

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

const ADDONS = [
  { label: "Oat Milk", price: "+$0.50" },
  { label: "Almond Milk", price: "+$0.75" },
  { label: "Extra Shot", price: "+$1.50" },
  { label: "Syrup", price: "+$0.50" },
];

export default function VoiceOrderPage() {
  return (
    <div className="voice-order-layout">
      <aside className="voice-menu-sidebar">
        <h2 className="voice-menu-heading">Menu</h2>

        <div className="voice-menu-group">
          <h3 className="voice-menu-group-title">
            <IconCoffee size={14} /> Coffee
            <span className="voice-menu-group-hint">sm / lg</span>
          </h3>
          <table className="voice-menu-table">
            <tbody>
              {MENU.coffee.map((d) => (
                <tr key={d.name}>
                  <td className="voice-menu-name">{d.name}</td>
                  <td className="voice-menu-price">${d.small.toFixed(2)}</td>
                  <td className="voice-menu-price">${d.large.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="voice-menu-group">
          <h3 className="voice-menu-group-title">
            <IconTea size={14} /> Tea
            <span className="voice-menu-group-hint">sm / lg</span>
          </h3>
          <table className="voice-menu-table">
            <tbody>
              {MENU.tea.map((d) => (
                <tr key={d.name}>
                  <td className="voice-menu-name">{d.name}</td>
                  <td className="voice-menu-price">${d.small.toFixed(2)}</td>
                  <td className="voice-menu-price">${d.large.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="voice-menu-group">
          <h3 className="voice-menu-group-title">
            <IconPastry size={14} /> Pastries
          </h3>
          <table className="voice-menu-table">
            <tbody>
              {MENU.pastries.map((p) => (
                <tr key={p.name}>
                  <td className="voice-menu-name">{p.name}</td>
                  <td className="voice-menu-price">${p.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="voice-menu-group">
          <h3 className="voice-menu-group-title">Add-Ons</h3>
          <div className="voice-menu-addons">
            {ADDONS.map((a) => (
              <span key={a.label} className="voice-addon-tag">
                {a.label} <span className="voice-addon-price">{a.price}</span>
              </span>
            ))}
          </div>
        </div>

        <p className="voice-menu-sizes">Small 12oz · Large 16oz</p>
      </aside>

      <main className="voice-chat-main">
        <ChatInterface />
      </main>
    </div>
  );
}
