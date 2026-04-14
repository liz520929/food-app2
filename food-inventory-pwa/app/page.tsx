
"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Clock3, Home, Refrigerator, Snowflake, Package, ChefHat } from "lucide-react";

type Item = { id: number; name: string; category: string; location: string; quantity: number; unit: string; purchaseDate: string; expiryDate: string; };
type Recipe = { id: number; name: string; ingredients: string[]; tags: string[]; note: string; };

const initialItems: Item[] = [
  { id: 1, name: "雞胸肉", category: "肉類", location: "冷凍", quantity: 2, unit: "份", purchaseDate: "2026-04-07", expiryDate: "2026-04-13" },
  { id: 2, name: "菠菜", category: "蔬菜", location: "冷藏", quantity: 1, unit: "把", purchaseDate: "2026-04-08", expiryDate: "2026-04-10" },
  { id: 3, name: "雞蛋", category: "蛋奶", location: "冷藏", quantity: 8, unit: "顆", purchaseDate: "2026-04-06", expiryDate: "2026-04-18" },
  { id: 4, name: "杏鮑菇", category: "蔬菜", location: "冷藏", quantity: 2, unit: "支", purchaseDate: "2026-04-08", expiryDate: "2026-04-11" },
  { id: 5, name: "牛奶", category: "蛋奶", location: "冷藏", quantity: 1, unit: "瓶", purchaseDate: "2026-04-05", expiryDate: "2026-04-12" },
  { id: 6, name: "白飯", category: "主食", location: "冷凍", quantity: 3, unit: "盒", purchaseDate: "2026-04-07", expiryDate: "2026-04-20" }
];

const recipeDatabase: Recipe[] = [
  { id: 1, name: "菠菜菇菇雞肉炒蛋", ingredients: ["雞胸肉", "菠菜", "雞蛋", "杏鮑菇"], tags: ["快炒", "高蛋白", "清冰箱"], note: "優先消耗菠菜與杏鮑菇，10 分鐘可完成。" },
  { id: 2, name: "奶香雞肉菠菜燉飯", ingredients: ["雞胸肉", "菠菜", "牛奶", "白飯"], tags: ["一鍋到底", "主食", "溫熱"], note: "適合把快到期牛奶一起用掉。" },
  { id: 3, name: "菇菇歐姆蛋", ingredients: ["雞蛋", "杏鮑菇", "牛奶"], tags: ["早餐", "快速", "低門檻"], note: "材料少、很適合忙的日子。" },
  { id: 4, name: "雞肉蛋炒飯", ingredients: ["雞胸肉", "雞蛋", "白飯"], tags: ["家常", "飽足", "好備餐"], note: "可再加青菜一起炒，提高纖維。" },
  { id: 5, name: "菠菜牛奶蒸蛋", ingredients: ["菠菜", "雞蛋", "牛奶"], tags: ["嫩口", "簡單", "低油"], note: "很適合快過期但數量不多的食材。" },
  { id: 6, name: "雞肉菇菇白醬飯", ingredients: ["雞胸肉", "杏鮑菇", "牛奶", "白飯"], tags: ["濃郁", "午餐", "清冰箱"], note: "食材重疊度高，消耗效率好。" }
];

const categories = ["蔬菜", "水果", "肉類", "海鮮", "蛋奶", "主食", "調味料", "其他"];
const allLocations = ["全部", "冷藏", "冷凍", "常溫"];
const selectableLocations = ["冷藏", "冷凍", "常溫"];
const units = ["份", "包", "盒", "瓶", "顆", "支", "把", "克"];

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
}
function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
function getStatus(expiryDate: string) {
  const diff = daysUntil(expiryDate);
  if (diff < 0) return { label: "已過期", className: "danger" };
  if (diff <= 2) return { label: "快到期", className: "warn" };
  if (diff <= 5) return { label: "先吃", className: "soft" };
  return { label: "新鮮", className: "good" };
}
function statusText(expiryDate: string) {
  const diff = daysUntil(expiryDate);
  if (diff < 0) return `過期 ${Math.abs(diff)} 天`;
  if (diff === 0) return "今天到期";
  return `${diff} 天後到期`;
}
function scoreRecipe(recipe: Recipe, inventoryNames: string[], urgentNames: string[]) {
  const matched = recipe.ingredients.filter((ing) => inventoryNames.includes(ing));
  const urgentMatches = matched.filter((ing) => urgentNames.includes(ing)).length;
  return matched.length * 10 + urgentMatches * 8;
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "recipes">("dashboard");
  const [locationFilter, setLocationFilter] = useState("全部");
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallTip, setShowInstallTip] = useState(false);
  const [form, setForm] = useState<Omit<Item, "id">>({ name: "", category: "蔬菜", location: "冷藏", quantity: 1, unit: "份", purchaseDate: "", expiryDate: "" });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("food-inventory-items");
      setItems(saved ? JSON.parse(saved) : initialItems);
    } catch {
      setItems(initialItems);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("food-inventory-items", JSON.stringify(items));
      setSaveNotice(true);
      const timer = window.setTimeout(() => setSaveNotice(false), 1200);
      return () => window.clearTimeout(timer);
    } catch {}
  }, [items, hydrated]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallTip(true);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => {
      const hitKeyword = !keyword || item.name.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword) || item.location.toLowerCase().includes(keyword);
      const hitLocation = locationFilter === "全部" || item.location === locationFilter;
      return hitKeyword && hitLocation;
    });
  }, [items, search, locationFilter]);

  const sortedByUrgency = useMemo(() => [...filteredItems].sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)), [filteredItems]);
  const urgentItems = useMemo(() => items.filter((item) => daysUntil(item.expiryDate) <= 2), [items]);
  const expiredItems = useMemo(() => items.filter((item) => daysUntil(item.expiryDate) < 0), [items]);
  const inventoryNames = useMemo(() => items.map((item) => item.name), [items]);
  const urgentNames = useMemo(() => urgentItems.map((item) => item.name), [urgentItems]);

  const recommendedRecipes = useMemo(() => recipeDatabase.map((recipe) => {
    const matched = recipe.ingredients.filter((ing) => inventoryNames.includes(ing));
    const missing = recipe.ingredients.filter((ing) => !inventoryNames.includes(ing));
    return { ...recipe, matched, missing, score: scoreRecipe(recipe, inventoryNames, urgentNames) };
  }).filter((recipe) => recipe.matched.length > 0).sort((a, b) => b.score - a.score), [inventoryNames, urgentNames]);

  const totalItems = items.length;
  const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const freshnessScore = Math.max(0, Math.min(100, 100 - expiredItems.length * 20 - urgentItems.length * 10));

  const handleAddItem = () => {
    if (!form.name || !form.expiryDate) return;
    setItems((prev) => [{ id: Date.now(), ...form, quantity: Number(form.quantity) }, ...prev]);
    setForm({ name: "", category: "蔬菜", location: "冷藏", quantity: 1, unit: "份", purchaseDate: "", expiryDate: "" });
    setShowModal(false);
  };
  const handleDelete = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));
  const handleConsumeOne = (id: number) => setItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity: Number(item.quantity) - 1 } : item).filter((item) => item.quantity > 0));
  const handleResetDemo = () => { setItems(initialItems); setSearch(""); setLocationFilter("全部"); };
  const handleClearAll = () => setItems([]);
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallTip(false);
  };

  const quickLocationButtons = [{ label: "全部", icon: Home }, { label: "冷藏", icon: Refrigerator }, { label: "冷凍", icon: Snowflake }, { label: "常溫", icon: Package }];

  if (!hydrated) return <div className="app-shell"><div className="panel">載入中…</div></div>;

  return (
    <div className="app-shell">
      <div className="panel">
        <div className="header-row">
          <div>
            <div className="small strong">你的冰箱今天如何？</div>
            <div className="title">食材庫存小管家</div>
            <div className="subtle mt-8">用手機快速記庫存、看快到期食材、直接找能煮的菜。</div>
            <div className="badges mt-12">
              <span className="badge">本地儲存</span>
              <span className="badge">手機版 UI</span>
              <span className="badge">可直接點用</span>
              {saveNotice && <span className="badge dark">已自動儲存</span>}
            </div>
          </div>
          <button className="fab" onClick={() => setShowModal(true)} aria-label="新增食材"><Plus size={20} /></button>
        </div>

        {showInstallTip && (
          <div className="install-tip">
            <div className="row-between">
              <div>
                <div className="strong">可安裝到手機桌面</div>
                <div className="small mt-8">部署成網址後，可直接加到主畫面，像 App 一樣點開使用。</div>
              </div>
              <button className="primary-btn" onClick={handleInstall}>安裝</button>
            </div>
          </div>
        )}

        <div className="action-row mt-12">
          <button className="secondary-btn" onClick={handleResetDemo}>恢復範例資料</button>
          <button className="secondary-btn" onClick={handleClearAll}>清空全部</button>
        </div>

        <div className="stats-grid">
          <div className="stat-box"><div className="small">種類</div><div className="stat-value mono">{totalItems}</div></div>
          <div className="stat-box"><div className="small">快到期</div><div className="stat-value mono">{urgentItems.length}</div></div>
          <div className="stat-box"><div className="small">建議食譜</div><div className="stat-value mono">{recommendedRecipes.length}</div></div>
        </div>
      </div>

      {activeTab === "dashboard" && <>
        <div className="panel mt-16">
          <div className="row-between">
            <div><div className="small">冰箱健康分數</div><div className="stat-value mono">{freshnessScore}%</div></div>
            <span className="badge">{`合計 ${totalQty} 單位`}</span>
          </div>
          <div className="progress-wrap"><div className="progress-bar" style={{ width: `${freshnessScore}%` }} /></div>
          <div className="small mt-8">分數越高，代表目前浪費風險越低。</div>
        </div>

        <div className="filters mt-16">
          {quickLocationButtons.map(({ label, icon: Icon }) => (
            <button key={label} className={`chip ${locationFilter === label ? "active" : ""}`} onClick={() => { setLocationFilter(label); setActiveTab("inventory"); }}>
              <Icon size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />{label}
            </button>
          ))}
        </div>

        <div className="panel mt-16">
          <div className="strong">今天先吃這些</div>
          <div className="list">
            {urgentItems.length === 0 ? <div className="empty">今天沒有特別急著要用掉的食材。</div> : urgentItems.slice(0, 4).map((item) => (
              <div className="card" key={item.id}>
                <div className="row-between">
                  <div><div className="strong">{item.name}</div><div className="small mt-8">{item.location} · {item.quantity} {item.unit}</div></div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`badge ${getStatus(item.expiryDate).className}`}>{getStatus(item.expiryDate).label}</span>
                    <div className="small mt-8">{statusText(item.expiryDate)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel mt-16">
          <div className="strong">立刻能做的料理</div>
          <div className="list">
            {recommendedRecipes.slice(0, 3).map((recipe) => (
              <div className="card" key={recipe.id}>
                <div className="row-between">
                  <div><div className="strong">{recipe.name}</div><div className="small mt-8">{recipe.note}</div></div>
                  <span className={`badge ${recipe.missing.length === 0 ? "good" : "soft"}`}>{recipe.missing.length === 0 ? "可直接做" : `缺 ${recipe.missing.length}`}</span>
                </div>
                <div className="badges mt-12">
                  {recipe.matched.map((item) => <span key={item} className={`badge ${urgentNames.includes(item) ? "warn" : ""}`}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>}

      {activeTab === "inventory" && <>
        <div className="panel mt-16">
          <div className="search-wrap">
            <Search className="search-icon" size={16} />
            <input className="search-box" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋食材、分類、位置" />
          </div>
          <div className="filters mt-12">
            {allLocations.map((location) => <button key={location} className={`chip ${locationFilter === location ? "active" : ""}`} onClick={() => setLocationFilter(location)}>{location}</button>)}
          </div>
        </div>

        <div className="list mt-16">
          {sortedByUrgency.map((item) => {
            const status = getStatus(item.expiryDate);
            return (
              <div className="item-card" key={item.id}>
                <div className="card-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="badges"><div className="item-name">{item.name}</div><span className={`badge ${status.className}`}>{status.label}</span></div>
                    <div className="badges mt-8"><span className="badge">{item.category}</span><span className="badge">{item.location}</span></div>
                    <div className="small mt-12">{item.quantity} {item.unit} · 到期 {formatDate(item.expiryDate)}</div>
                    <div className="subtle strong mt-8">{statusText(item.expiryDate)}</div>
                  </div>
                  <button className="ghost-btn" onClick={() => handleDelete(item.id)} aria-label="刪除"><Trash2 size={18} /></button>
                </div>
                <div className="action-grid">
                  <button className="secondary-btn" onClick={() => handleConsumeOne(item.id)}>用掉 1{item.unit}</button>
                  <button className="secondary-btn"><Clock3 size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />查看期限</button>
                </div>
              </div>
            );
          })}
          {sortedByUrgency.length === 0 && <div className="empty">目前沒有符合條件的食材。</div>}
        </div>
      </>}

      {activeTab === "recipes" && <div className="panel mt-16">
        <div className="row-between"><div className="strong">依庫存推薦</div><ChefHat size={18} /></div>
        <div className="list">
          {recommendedRecipes.map((recipe) => (
            <div className="card" key={recipe.id}>
              <div className="row-between">
                <div><div className="strong">{recipe.name}</div><div className="small mt-8">{recipe.note}</div></div>
                <span className={`badge ${recipe.missing.length === 0 ? "good" : recipe.missing.length === 1 ? "warn" : "soft"}`}>
                  {recipe.missing.length === 0 ? "可直接做" : recipe.missing.length === 1 ? "缺 1 樣" : `缺 ${recipe.missing.length} 樣`}
                </span>
              </div>
              <div className="mt-12"><div className="small strong">已有食材</div><div className="badges mt-8">{recipe.matched.map((item) => <span key={item} className={`badge ${urgentNames.includes(item) ? "warn" : ""}`}>{item}</span>)}</div></div>
              {recipe.missing.length > 0 && <div className="mt-12"><div className="small strong">還缺</div><div className="badges mt-8">{recipe.missing.map((item) => <span key={item} className="badge danger">{item}</span>)}</div></div>}
              <div className="badges mt-12">{recipe.tags.map((tag) => <span key={tag} className="badge">{tag}</span>)}</div>
            </div>
          ))}
        </div>
      </div>}

      {showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="row-between"><div className="strong" style={{ fontSize: 20 }}>新增食材</div><button className="ghost-btn" onClick={() => setShowModal(false)}>✕</button></div>
          <div className="mt-12">
            <label className="label">食材名稱</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：雞胸肉" />
          </div>
          <div className="form-grid two mt-12">
            <div><label className="label">分類</label><select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
            <div><label className="label">存放位置</label><select className="select" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>{selectableLocations.map((location) => <option key={location} value={location}>{location}</option>)}</select></div>
            <div><label className="label">數量</label><input className="input" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
            <div><label className="label">單位</label><select className="select" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>{units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></div>
            <div><label className="label">購入日</label><input className="input" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} /></div>
            <div><label className="label">到期日</label><input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
          </div>
          <div className="mt-16"><button className="primary-btn" style={{ width: "100%" }} onClick={handleAddItem}>儲存食材</button></div>
        </div>
      </div>}

      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <button className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>總覽</button>
          <button className={`nav-btn ${activeTab === "inventory" ? "active" : ""}`} onClick={() => setActiveTab("inventory")}>庫存</button>
          <button className={`nav-btn ${activeTab === "recipes" ? "active" : ""}`} onClick={() => setActiveTab("recipes")}>食譜</button>
        </div>
      </div>
    </div>
  );
}
