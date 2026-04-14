return (
  <div style={{
    maxWidth: 420,
    margin: "0 auto",
    padding: 20,
    fontFamily: "system-ui",
  }}>
    {/* 標題 */}
    <h1 style={{
      fontSize: 28,
      fontWeight: 800,
      marginBottom: 20
    }}>
      🍱 食材庫存
    </h1>

    {/* 新增卡片 */}
    <div style={{
      background: "#fff",
      padding: 16,
      borderRadius: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      marginBottom: 20
    }}>
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
          border: "1px solid #ddd"
        }}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="number"
          value={newItem.quantity}
          onChange={(e) =>
            setNewItem({ ...newItem, quantity: Number(e.target.value) })
          }
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd"
          }}
        />

        <input
          type="date"
          value={newItem.expiryDate}
          onChange={(e) =>
            setNewItem({ ...newItem, expiryDate: e.target.value })
          }
          style={{
            flex: 2,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd"
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
          border: "none"
        }}
      >
        ➕ 新增食材
      </button>
    </div>

    {/* 食材列表 */}
    <div style={{ marginBottom: 24 }}>
      {items.map((item) => (
        <div key={item.id} style={{
          background: "#fff",
          padding: 14,
          borderRadius: 14,
          marginBottom: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontWeight: 700 }}>
            {item.name} × {item.quantity}
          </div>
          <div style={{ color: "#666", fontSize: 13 }}>
            到期：{item.expiryDate}
          </div>
        </div>
      ))}
    </div>

    {/* 食譜 */}
    <h2 style={{
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 12
    }}>
      🍳 推薦食譜
    </h2>

    {recommendedRecipes.map((recipe) => (
      <div key={recipe.id} style={{
        background: "#fff",
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <div style={{ fontWeight: 700 }}>
          {recipe.name}
        </div>

        <div style={{ fontSize: 13, marginTop: 6 }}>
          <span style={{ color: "#16a34a" }}>
            已有：{recipe.matched.join(", ") || "無"}
          </span>
        </div>

        <div style={{ fontSize: 13 }}>
          <span style={{ color: "#dc2626" }}>
            缺少：{recipe.missing.join(", ") || "無"}
          </span>
        </div>
      </div>
    ))}
  </div>
);
