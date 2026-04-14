"use client";

import { useMemo, useState } from "react";

type Item = {
  id: number;
  name: string;
  quantity: number;
  expiryDate: string;
};

type Recipe = {
  id: number;
  name: string;
  ingredients: string[];
};

const recipeDatabase: Recipe[] = [
  { id: 1, name: "雞肉炒蛋", ingredients: ["雞胸肉", "雞蛋"] },
  { id: 2, name: "菠菜炒蛋", ingredients: ["菠菜", "雞蛋"] },
  { id: 3, name: "奶油雞肉飯", ingredients: ["雞胸肉", "牛奶"] },
  { id: 4, name: "菇菇炒雞肉", ingredients: ["雞胸肉", "杏鮑菇"] },
];

export default function Page() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "雞胸肉", quantity: 2, expiryDate: "2026-04-15" },
    { id: 2, name: "雞蛋", quantity: 5, expiryDate: "2026-04-12" },
  ]);

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    expiryDate: "",
  });

  // 🔥 食譜會動（核心）
  const recommendedRecipes = useMemo(() => {
    return recipeDatabase
      .map((recipe) => {
        const matched = recipe.ingredients.filter((ing) =>
          items.some((item) => item.name === ing)
        );

        const missing = recipe.ingredients.filter(
          (ing) => !items.some((item) => item.name === ing)
        );

        let urgentScore = 0;

        matched.forEach((ing) => {
          const item = items.find((i) => i.name === ing);
          if (!item) return;

          const diff =
            (new Date(item.expiryDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24);

          if (diff <= 2) urgentScore += 1;
        });

        return {
          ...recipe,
          matched,
          missing,
          score: matched.length * 10 + urgentScore * 20,
        };
      })
      .filter((r) => r.matched.length > 0)
      .sort((a, b) => b.score - a.score);
  }, [items]);

  const addItem = () => {
    if (!newItem.name || !newItem.expiryDate) return;

    setItems([
      ...items,
      { id: Date.now(), ...newItem }
    ]);

    setNewItem({ name: "", quantity: 1, expiryDate: "" });
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* 標題 */}
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        🍱 食材庫存
      </h1>

      {/* 新增卡片 */}
      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginTop: 12,
        }}
      >
        <input
          placeholder="食材名稱"
          value={newItem.name}
          onChange={(e) =>
            setNewItem({ ...newItem, name: e.target.value })
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="number"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                quantity: Number(e.target.value),
              })
            }
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />

          <input
            type="date"
            value={newItem.expiryDate}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                expiryDate: e.target.value,
              })
            }
            style={{
              flex: 2,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </div>

        <button
          onClick={addItem}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 12,
            borderRadius: 12,
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            border: "none",
          }}
        >
          ➕ 新增食材
        </button>
      </div>

      {/* 食材列表 */}
      <div style={{ marginTop: 20 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#fff",
              padding: 14,
              borderRadius: 14,
              marginBottom: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {item.name} × {item.quantity}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              到期：{item.expiryDate}
            </div>
          </div>
        ))}
      </div>

      {/* 食譜 */}
      <h2 style={{ marginTop: 24 }}>🍳 推薦食譜</h2>

      {recommendedRecipes.map((recipe) => (
        <div
          key={recipe.id}
          style={{
            background: "#fff",
            padding: 14,
            borderRadius: 14,
            marginTop: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontWeight: 700 }}>
            {recipe.name}
          </div>

          <div style={{ fontSize: 13, color: "#16a34a" }}>
            已有：{recipe.matched.join(", ") || "無"}
          </div>

          <div style={{ fontSize: 13, color: "#dc2626" }}>
            缺少：{recipe.missing.join(", ") || "無"}
          </div>
        </div>
      ))}
    </div>
  );
}
