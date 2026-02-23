import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Calendar, Wallet, CheckSquare, Package, 
  CloudSun, Trash2, Backpack, FolderOpen, Plus, 
  ArrowLeft, Check, X, MoreVertical, MapPin, Search,
  ChevronLeft, ChevronRight, Sparkles, Sun, Cloud, CloudRain,
  Store, Edit2, ShoppingBag, Settings, ArrowRight
} from 'lucide-react';

// --- Mock Data & Utilities ---

const INITIAL_SHOPPING_LISTS = [
  { 
    id: 'general', 
    name: 'Allgemein', 
    fixed: true, 
    items: [
      { id: 1, text: 'Milch', done: false },
      { id: 2, text: 'Müllbeutel', done: false }
    ] 
  },
  { 
    id: 'rewe', 
    name: 'Rewe', 
    fixed: false, 
    items: [
      { id: 3, text: 'Frisches Brot', done: true },
      { id: 4, text: 'Äpfel', done: false }
    ] 
  },
  { 
    id: 'dm', 
    name: 'dm Drogerie', 
    fixed: false, 
    items: [
      { id: 5, text: 'Zahnpasta', done: false }
    ] 
  }
];

const INITIAL_TASKS = [
  { id: 1, text: 'Spülmaschine ausräumen', assign: 'Max', done: false },
  { id: 2, text: 'Rasen mähen', assign: 'Papa', done: false },
  { id: 3, text: 'Hausaufgaben', assign: 'Lisa', done: true },
];

const FINANCE_DATA = {
  balance: 1450.50,
  transactions: [
    { id: 1, title: 'Wocheneinkauf Rewe', amount: -85.20, date: 'Heute' },
    { id: 2, title: 'Taschengeld Max', amount: -15.00, date: 'Gestern' },
    { id: 3, title: 'Rückerstattung Strom', amount: +120.00, date: '24.10.' },
  ]
};

// Abfallkalender 2026 – Bezirk 2
const BEZIRK2_WASTE_DATES = {
  restmuell: [
    [2026,0,2],[2026,0,16],[2026,0,30],
    [2026,1,13],[2026,1,27],
    [2026,2,13],[2026,2,27],
    [2026,3,11],[2026,3,24],
    [2026,4,8],[2026,4,22],
    [2026,5,6],[2026,5,19],
    [2026,6,3],[2026,6,17],[2026,6,31],
    [2026,7,14],[2026,7,28],
    [2026,8,11],[2026,8,25],
    [2026,9,9],[2026,9,23],
    [2026,10,6],[2026,10,20],
    [2026,11,4],[2026,11,18],[2026,11,30],
  ],
  bio: [
    [2026,0,5],[2026,0,19],
    [2026,1,2],[2026,1,17],
    [2026,2,2],[2026,2,16],[2026,2,30],
    [2026,3,7],[2026,3,13],[2026,3,20],[2026,3,27],
    [2026,4,4],[2026,4,11],[2026,4,18],[2026,4,26],
    [2026,5,1],[2026,5,8],[2026,5,15],[2026,5,22],[2026,5,29],
    [2026,6,6],[2026,6,13],[2026,6,20],[2026,6,27],
    [2026,7,3],[2026,7,10],[2026,7,17],[2026,7,24],[2026,7,31],
    [2026,8,7],[2026,8,14],[2026,8,21],[2026,8,28],
    [2026,9,5],[2026,9,12],[2026,9,19],[2026,9,26],
    [2026,10,2],[2026,10,9],[2026,10,16],[2026,10,23],
    [2026,11,7],[2026,11,21],
  ],
  altpapier: [
    [2026,0,21],
    [2026,1,19],
    [2026,2,18],
    [2026,3,15],
    [2026,4,13],
    [2026,5,10],
    [2026,6,8],
    [2026,7,5],
    [2026,8,2],[2026,8,30],
    [2026,9,28],
    [2026,10,25],
    [2026,11,22],
  ],
  gelbeTonne: [
    [2026,0,8],[2026,0,22],
    [2026,1,5],[2026,1,20],
    [2026,2,5],[2026,2,19],
    [2026,3,2],[2026,3,16],[2026,3,30],
    [2026,4,15],[2026,4,29],
    [2026,5,11],[2026,5,25],
    [2026,6,9],[2026,6,23],
    [2026,7,6],[2026,7,20],
    [2026,8,3],[2026,8,17],
    [2026,9,1],[2026,9,15],[2026,9,29],
    [2026,10,12],[2026,10,26],
    [2026,11,10],[2026,11,23],
  ],
};

const WEEKDAY_ABBR = ['So','Mo','Di','Mi','Do','Fr','Sa'];

const getNextWasteDate = (dates) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  for (const [y, m, d] of dates) {
    const dt = new Date(y, m, d);
    if (dt >= today) {
      if (dt.getTime() === today.getTime()) return 'Heute';
      if (dt.getTime() === tomorrow.getTime()) return 'Morgen';
      const dd = String(d).padStart(2, '0');
      const mm = String(m + 1).padStart(2, '0');
      return `${WEEKDAY_ABBR[dt.getDay()]}, ${dd}.${mm}.`;
    }
  }
  return '—';
};

const getNextTrashSummary = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const all = [
    ...BEZIRK2_WASTE_DATES.restmuell.map(([y,m,d]) => ({ dt: new Date(y,m,d), type: 'Restmüll' })),
    ...BEZIRK2_WASTE_DATES.bio.map(([y,m,d]) => ({ dt: new Date(y,m,d), type: 'Bio' })),
    ...BEZIRK2_WASTE_DATES.altpapier.map(([y,m,d]) => ({ dt: new Date(y,m,d), type: 'Papier' })),
    ...BEZIRK2_WASTE_DATES.gelbeTonne.map(([y,m,d]) => ({ dt: new Date(y,m,d), type: 'Gelber Sack' })),
  ].filter(e => e.dt >= today).sort((a, b) => a.dt - b.dt);
  if (!all.length) return '—';
  const { dt, type } = all[0];
  const label = dt.getTime() === today.getTime() ? 'Heute' : dt.getTime() === tomorrow.getTime() ? 'Morgen' : WEEKDAY_ABBR[dt.getDay()];
  return `${label}: ${type}`;
};

const getDaysUntil = (dates) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const [y, m, d] of dates) {
    const dt = new Date(y, m, d);
    if (dt >= today) return Math.round((dt - today) / 86400000);
  }
  return null;
};

const TRASH_SCHEDULE = [
  { type: 'Restmüll', color: 'bg-gray-700', date: getNextWasteDate(BEZIRK2_WASTE_DATES.restmuell), dates: BEZIRK2_WASTE_DATES.restmuell },
  { type: 'Bio', color: 'bg-green-700', date: getNextWasteDate(BEZIRK2_WASTE_DATES.bio), dates: BEZIRK2_WASTE_DATES.bio },
  { type: 'Papier', color: 'bg-blue-600', date: getNextWasteDate(BEZIRK2_WASTE_DATES.altpapier), dates: BEZIRK2_WASTE_DATES.altpapier },
  { type: 'Gelber Sack', color: 'bg-yellow-500', date: getNextWasteDate(BEZIRK2_WASTE_DATES.gelbeTonne), dates: BEZIRK2_WASTE_DATES.gelbeTonne },
];

const PACKING_COLORS = [
  'bg-rose-400', 'bg-indigo-400', 'bg-green-500', 'bg-amber-500',
  'bg-purple-400', 'bg-blue-400', 'bg-orange-400', 'bg-teal-500',
];

const INITIAL_PACKING_LISTS = [
  {
    id: 'urlaub-herbst',
    name: 'Urlaub Herbst',
    color: 'bg-rose-400',
    items: [
      { id: 1, text: 'Reisepass', done: false },
      { id: 2, text: 'Sonnencreme', done: false },
      { id: 3, text: 'Ladekabel', done: true },
    ],
  },
];

const getDailySummary = (offset) => {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  
  const date = new Date();
  date.setDate(date.getDate() + offset);
  
  const dayName = offset === 0 ? 'Heute' : offset === 1 ? 'Morgen' : offset === -1 ? 'Gestern' : days[date.getDay()];
  const dateString = `${date.getDate()}. ${months[date.getMonth()]}`;
  
  let summary = "";
  let weather = {};

  if (offset === 0) {
    summary = "Guten Morgen! Heute steht der Elternabend um 19:00 Uhr an. Max ist für die Spülmaschine eingeteilt. Vergiss nicht, morgen ist Restmüll!";
    weather = { icon: CloudSun, temp: "18°", desc: "Teils bewölkt", range: "12° - 21°" };
  } else if (offset === 1) {
    summary = "Morgen hat Max Fußballtraining (16:30). Denk an den Restmüll! Das Wetter wird sonnig, perfekt für den Garten.";
    weather = { icon: Sun, temp: "22°", desc: "Sonnig", range: "14° - 24°" };
  } else {
    summary = "Ein ruhigerer Tag. Keine dringenden Termine im Kalender. Zeit für die offenen Aufgaben auf der Liste.";
    weather = { icon: CloudRain, temp: "16°", desc: "Regnerisch", range: "11° - 17°" };
  }

  return { dayName, dateString, summary, weather };
};

// Fetch company logos via Google's favicon service (free, no API key required)
const getLogoUrl = (domain) =>
  domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
    : null;

// Helper to resolve Store Metadata (Logo or Fallback Style)
const getStoreMeta = (name, resolvedDomain) => {
  const n = name.toLowerCase();
  // Normalize umlauts for matching (e.g. "Müller" → "muller")
  const nNorm = n.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');

  // 1. Specific manual styles for non-logo items
  if (n.includes('allgemein')) {
    return { type: 'icon', bg: 'bg-gray-800', text: 'text-white', content: <ShoppingBag size={24}/> };
  }

  // 2. Known stores – precise domain for real logo lookup
  const domainMap = {
    'rewe':       { domain: 'rewe.de',           bg: 'bg-red-100',    text: 'text-red-600' },
    'aldi':       { domain: 'aldi-sued.de',       bg: 'bg-blue-100',   text: 'text-blue-700' },
    'lidl':       { domain: 'lidl.de',            bg: 'bg-yellow-100', text: 'text-blue-700' },
    'dm':         { domain: 'dm.de',              bg: 'bg-pink-100',   text: 'text-pink-700' },
    'rossmann':   { domain: 'rossmann.de',        bg: 'bg-red-100',    text: 'text-red-700' },
    'edeka':      { domain: 'edeka.de',           bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'kaufland':   { domain: 'kaufland.de',        bg: 'bg-red-100',    text: 'text-red-700' },
    'netto':      { domain: 'netto-online.de',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'ikea':       { domain: 'ikea.com',           bg: 'bg-yellow-100', text: 'text-blue-800' },
    'obi':        { domain: 'obi.de',             bg: 'bg-orange-100', text: 'text-orange-700' },
    'hornbach':   { domain: 'hornbach.de',        bg: 'bg-orange-100', text: 'text-orange-700' },
    'bauhaus':    { domain: 'bauhaus.info',       bg: 'bg-red-100',    text: 'text-red-700' },
    'amazon':     { domain: 'amazon.de',          bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'zara':       { domain: 'zara.com',           bg: 'bg-gray-100',   text: 'text-gray-800' },
    'h&m':        { domain: 'hm.com',             bg: 'bg-red-100',    text: 'text-red-700' },
    'douglas':    { domain: 'douglas.de',         bg: 'bg-purple-100', text: 'text-purple-700' },
    'mediamarkt': { domain: 'mediamarkt.de',      bg: 'bg-red-100',    text: 'text-red-700' },
    'saturn':     { domain: 'saturn.de',          bg: 'bg-blue-100',   text: 'text-blue-700' },
    'penny':      { domain: 'penny.de',           bg: 'bg-red-100',    text: 'text-red-700' },
    'norma':      { domain: 'norma-online.de',    bg: 'bg-red-100',    text: 'text-red-700' },
    'action':     { domain: 'action.com',         bg: 'bg-red-100',    text: 'text-red-700' },
    'tedi':       { domain: 'tedi.eu',            bg: 'bg-blue-100',   text: 'text-blue-700' },
    'muller':     { domain: 'muellerltd.de',      bg: 'bg-purple-100', text: 'text-purple-700' },
    'metro':      { domain: 'metro.de',           bg: 'bg-blue-100',   text: 'text-blue-700' },
    'apple':      { domain: 'apple.com',          bg: 'bg-gray-100',   text: 'text-gray-800' },
    'nike':       { domain: 'nike.com',           bg: 'bg-gray-100',   text: 'text-gray-800' },
    'adidas':     { domain: 'adidas.de',          bg: 'bg-gray-100',   text: 'text-gray-800' },
    'zalando':    { domain: 'zalando.de',         bg: 'bg-orange-100', text: 'text-orange-700' },
    'otto':       { domain: 'otto.de',            bg: 'bg-red-100',    text: 'text-red-700' },
    'deichmann':  { domain: 'deichmann.com',      bg: 'bg-red-100',    text: 'text-red-700' },
  };

  for (const [key, meta] of Object.entries(domainMap)) {
    if (nNorm.includes(key) || n.includes(key)) {
      return {
        type: 'logo',
        src: getLogoUrl(resolvedDomain || meta.domain),
        fallbackLetter: name.charAt(0).toUpperCase(),
        bg: meta.bg,
        text: meta.text,
      };
    }
  }

  // 3. Newly created / unknown stores – use provided domain or guess from name
  const domain = resolvedDomain || (nNorm.replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/)[0] + '.de');

  return {
    type: 'logo',
    src: getLogoUrl(domain),
    fallbackLetter: name.charAt(0).toUpperCase(),
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
  };
};

// Component to render the Logo or the Fallback safely
const StoreIcon = ({ name, brandDomain, className, size = "w-12 h-12" }) => {
  const meta = getStoreMeta(name, brandDomain);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [name, brandDomain]);

  if (meta.type === 'logo' && meta.src && !failed) {
    return (
      <img
        src={meta.src}
        alt={name}
        className={`${size} ${className} object-contain rounded-xl bg-white p-1`}
        onError={() => setFailed(true)}
      />
    );
  }

  // Letter / icon fallback
  const bgColor = meta.bg || 'bg-indigo-100';
  const textColor = meta.text || 'text-indigo-600';
  const content = meta.type === 'icon' ? meta.content : meta.fallbackLetter;

  return (
    <div className={`${size} ${className} flex items-center justify-center font-bold text-xl rounded-2xl ${bgColor} ${textColor}`}>
      {content}
    </div>
  );
};


// --- Components ---

const Header = ({ title, onBack, rightAction }) => (
  <div className="flex items-center justify-between p-4 pb-2">
    <div className="flex items-center">
      {onBack && (
        <button onClick={onBack} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      )}
      <h1 className="text-2xl font-normal text-gray-800 tracking-tight truncate max-w-[200px]">{title}</h1>
    </div>
    {rightAction}
  </div>
);

const FAB = ({ onClick, icon: Icon }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center transition-transform active:scale-95 z-50"
  >
    <Icon size={24} />
  </button>
);

const DailyOverviewTile = ({ offset, setOffset, onWeatherClick }) => {
  const data = getDailySummary(offset);
  const WeatherIcon = data.weather.icon;

  return (
    <div className="mx-4 mt-6 mb-2 bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden transition-all duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setOffset(offset - 1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-300" />
          </button>
          
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-widest text-indigo-300 mb-1">Tagesübersicht</div>
            <div className="text-xl font-semibold">{data.dayName}, {data.dateString}</div>
          </div>

          <button onClick={() => setOffset(offset + 1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronRight size={24} className="text-gray-300" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Sparkles className="text-yellow-300 shrink-0 mt-1" size={20} />
            <p className="text-lg leading-snug font-light text-gray-100">{data.summary}</p>
          </div>

          <div onClick={onWeatherClick} className="bg-white/10 rounded-2xl p-3 flex items-center justify-between mt-2 backdrop-blur-md cursor-pointer hover:bg-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <WeatherIcon size={24} className="text-indigo-200" />
              <div>
                <div className="font-medium">{data.weather.temp} • {data.weather.desc}</div>
                <div className="text-xs text-gray-400">Tagesverlauf</div>
              </div>
            </div>
            <div className="text-sm text-gray-300 font-mono">{data.weather.range}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShoppingView = ({ onBack }) => {
  const LONG_PRESS_DURATION_MS = 450;
  const CLICK_SUPPRESS_DURATION_MS = 350;
  const [lists, setLists] = useState(() => {
    try {
      const saved = localStorage.getItem('family_app_shopping_lists');
      return saved ? JSON.parse(saved) : INITIAL_SHOPPING_LISTS;
    } catch {
      return INITIAL_SHOPPING_LISTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('family_app_shopping_lists', JSON.stringify(lists));
    } catch {
      // storage quota exceeded or unavailable – ignore
    }
  }, [lists]);

  const [activeListId, setActiveListId] = useState(INITIAL_SHOPPING_LISTS[0].id);
  const [newItemInput, setNewItemInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [moveItemState, setMoveItemState] = useState(null); // { id, sourceId }
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const [bulkDragMode, setBulkDragMode] = useState(false);
  const longPressTimerRef = useRef(null);
  const suppressClickUntilRef = useRef(0);
  const [draggedListId, setDraggedListId] = useState(null);

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewListName('');
  };

  const addNewList = () => {
    const trimmedName = newListName.trim();
    if (!trimmedName) return;
    const newList = {
      id: crypto.randomUUID(),
      name: trimmedName,
      fixed: false,
      items: [],
    };
    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
    closeCreateModal();
  };

  const deleteList = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    const remaining = lists.filter(l => l.id !== deleteConfirmId);
    setLists(remaining);
    if (activeListId === deleteConfirmId && remaining.length > 0) {
      setActiveListId(remaining[0].id);
    }
    setDeleteConfirmId(null);
  };

  const addItemToList = () => {
    if (!newItemInput.trim()) return;
    setLists(lists.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          items: [...list.items, { id: Date.now(), text: newItemInput, done: false }]
        };
      }
      return list;
    }));
    setNewItemInput('');
  };

  const toggleItem = (itemId) => {
    setLists(lists.map(list => ({
      ...list,
      items: list.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i)
    })));
  };

  const deleteItem = (e, itemId) => {
    e.stopPropagation();
    setLists(lists.map(list => ({
      ...list,
      items: list.items.filter(i => i.id !== itemId)
    })));
  };

  const moveItemToList = (targetListId) => {
    if (!moveItemState) return;
    const { id: itemId, sourceId } = moveItemState;
    let itemToMove = null;
    const withRemoved = lists.map(list => {
      if (list.id === sourceId) {
        const found = list.items.find(i => i.id === itemId);
        if (found) itemToMove = { text: found.text };
        return { ...list, items: list.items.filter(i => i.id !== itemId) };
      }
      return list;
    });
    if (itemToMove) {
      setLists(withRemoved.map(list => {
        if (list.id === targetListId) {
          return { ...list, items: [...list.items, { id: Date.now(), text: itemToMove.text, done: false }] };
        }
        return list;
      }));
    }
    setMoveItemState(null);
  };

  const stopLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const itemKey = (item) => `${item.sourceId}:${item.id}`;

  const startItemLongPress = (item) => {
    stopLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      const key = itemKey(item);
      if (selectedItemKeys.includes(key)) {
        setBulkDragMode(true);
      } else {
        setSelectedItemKeys([key]);
        setBulkDragMode(false);
      }
      suppressClickUntilRef.current = Date.now() + CLICK_SUPPRESS_DURATION_MS;
    }, LONG_PRESS_DURATION_MS);
  };

  const toggleItemSelection = (item) => {
    const key = itemKey(item);
    setSelectedItemKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const moveSelectedItemsToList = (targetListId) => {
    if (!selectedItemKeys.length || targetListId === 'general') return;
    const selectedKeySet = new Set(selectedItemKeys);
    const withRemoved = lists.map(list => {
      if (list.id === targetListId) return list;
      return { ...list, items: list.items.filter(i => !selectedKeySet.has(`${list.id}:${i.id}`)) };
    });
    const movedItems = lists.flatMap(list =>
      list.id === targetListId
        ? []
        : list.items
            .filter(i => selectedKeySet.has(`${list.id}:${i.id}`))
            .map(i => ({ text: i.text, done: false }))
    );
    if (!movedItems.length) return;
    const maxItemId = lists
      .flatMap(list => list.items.map(i => Number(i.id)))
      .filter(Number.isFinite)
      .reduce((max, id) => Math.max(max, id), 0);
    const baseMoveId = maxItemId || Date.now();
    setLists(withRemoved.map(list => list.id === targetListId ? {
      ...list,
      items: [...list.items, ...movedItems.map((item, index) => ({ ...item, id: baseMoveId + index }))]
    } : list));
    setSelectedItemKeys([]);
    setBulkDragMode(false);
  };

  const reorderLists = (draggedId, targetId) => {
    if (draggedId === targetId || draggedId === 'general' || targetId === 'general') return;
    const dragIdx = lists.findIndex(l => l.id === draggedId);
    const targetIdx = lists.findIndex(l => l.id === targetId);
    if (dragIdx === -1 || targetIdx === -1) return;
    const newLists = [...lists];
    const [removed] = newLists.splice(dragIdx, 1);
    newLists.splice(targetIdx, 0, removed);
    setLists(newLists);
  };

  const activeList = lists.find(l => l.id === activeListId) || lists[0];
  
  const itemsToDisplay = activeList.id === 'general'
    ? lists.flatMap(l => l.items.map(i => ({ ...i, sourceName: l.name, sourceId: l.id })))
           .sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1))
    : activeList.items.map(i => ({ ...i, sourceName: activeList.name, sourceId: activeList.id }));

  const openCount = itemsToDisplay.filter(i => !i.done).length;
  const isSelectionMode = selectedItemKeys.length > 0;

  return (
    <div className="animate-fade-in flex flex-col h-full bg-gray-50 min-h-screen">
      <Header title="Einkaufen" onBack={onBack} />
      
      {/* 1. Horizontal Scrollable Tile List (Square Tiles with Logos) */}
      <div className="px-4 pb-2">
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
          {lists.map(list => {
            const isActive = activeListId === list.id;
            
            let openItems = 0;
            if (list.id === 'general') {
                openItems = lists.reduce((acc, l) => acc + l.items.filter(i => !i.done).length, 0);
            } else {
                openItems = list.items.filter(i => !i.done).length;
            }

            return (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                draggable={list.id !== 'general' && !bulkDragMode}
                onDragStart={(e) => {
                  if (list.id === 'general' || bulkDragMode) { e.preventDefault(); return; }
                  setDraggedListId(list.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => setDraggedListId(null)}
                onDragOver={(e) => {
                  if (bulkDragMode) {
                    if (list.id !== 'general') e.preventDefault();
                    return;
                  }
                  if (draggedListId && draggedListId !== list.id && list.id !== 'general') e.preventDefault();
                }}
                onDrop={(e) => {
                  if (bulkDragMode) {
                    if (list.id === 'general') return;
                    e.preventDefault();
                    moveSelectedItemsToList(list.id);
                    return;
                  }
                  if (!draggedListId || draggedListId === list.id || list.id === 'general') return;
                  e.preventDefault();
                  reorderLists(draggedListId, list.id);
                  setDraggedListId(null);
                }}
                className={`snap-start relative overflow-hidden flex-shrink-0 w-36 h-36 rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer border border-gray-100 ${
                  isActive
                    ? 'bg-white ring-4 ring-offset-2 ring-indigo-200 shadow-xl scale-105 z-10'
                    : 'bg-white shadow-sm hover:bg-gray-50 hover:shadow-md'
                } ${bulkDragMode && list.id !== 'general' ? 'ring-2 ring-indigo-300' : ''} ${draggedListId === list.id ? 'opacity-40' : ''} ${draggedListId && draggedListId !== list.id && list.id !== 'general' ? 'ring-2 ring-dashed ring-indigo-300' : ''}`}
              >
                 {/* Background blob like DashboardTile */}
                 <div className="absolute top-0 right-0 p-20 rounded-full opacity-5 translate-x-8 -translate-y-8 bg-indigo-400"></div>

                 {/* Logo at top-left, item count badge at top-right */}
                 <div className="flex justify-between items-start z-10">
                   <StoreIcon name={list.name} brandDomain={list.brandDomain} size="w-10 h-10" />
                   {openItems > 0 && (
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                       isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                     }`}>
                       {openItems}
                     </div>
                   )}
                 </div>

                 {/* Name and open count at bottom */}
                 <div className="z-10">
                   <h3 className={`text-sm font-medium leading-tight truncate ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>
                     {list.name}
                   </h3>
                   <p className="text-xs text-gray-500 mt-0.5">{openItems} offen</p>
                 </div>
              </button>
            );
          })}
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="snap-start flex-shrink-0 w-36 h-36 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-400 transition-colors"
          >
            <Plus size={24} />
            <span className="text-xs font-medium mt-1">Neu</span>
          </button>
        </div>
      </div>

      {/* 2. List Content Area */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col relative z-20 mt-2">
        
        <div className="p-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StoreIcon name={activeList.name} brandDomain={activeList.brandDomain} size="w-10 h-10 shadow-sm border border-gray-100" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                  {activeList.name}
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                   {openCount} Artikel offen
                </span>
              </div>
            </div>
            {!activeList.fixed && (
               <button 
                 onClick={() => deleteList(activeListId)}
                 className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
               >
                 <Trash2 size={18} />
               </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
           {itemsToDisplay.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-gray-300 mt-4">
                 <ShoppingBag size={40} className="mb-2 opacity-20" />
                 <p className="text-sm">Keine Artikel auf der Liste</p>
               </div>
           ) : (
                itemsToDisplay.map(item => {
                  const key = itemKey(item);
                  const isSelected = selectedItemKeys.includes(key);
                  return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      if (Date.now() < suppressClickUntilRef.current) {
                        return;
                      }
                      if (isSelectionMode) {
                        toggleItemSelection(item);
                        setBulkDragMode(false);
                      } else {
                        toggleItem(item.id);
                      }
                    }}
                    onPointerDown={() => startItemLongPress(item)}
                    onPointerUp={stopLongPressTimer}
                    onPointerLeave={stopLongPressTimer}
                    draggable={bulkDragMode && isSelected}
                    onDragStart={(e) => {
                      if (!(bulkDragMode && isSelected)) {
                        e.preventDefault();
                        return;
                      }
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className={`group flex items-center p-4 rounded-2xl transition-all duration-200 cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                        : item.done ? 'bg-gray-50 border-transparent' : 'bg-white border-gray-100 shadow-sm'
                    }`}
                  >
                   <div className={`w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center transition-colors ${item.done ? 'border-gray-300 bg-gray-300' : 'border-indigo-400'}`}>
                     {item.done && <Check size={16} className="text-white" />}
                   </div>
                   
                   <div className="flex-1 flex flex-col justify-center">
                       <span className={`font-medium ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                           {item.text}
                       </span>
                       {activeList.id === 'general' && item.sourceId !== 'general' && (
                           <div className="flex items-center mt-1">
                               <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                   {item.sourceName}
                               </span>
                           </div>
                       )}
                   </div>
                   
                   <button
                     onClick={(e) => { e.stopPropagation(); setMoveItemState({ id: item.id, sourceId: item.sourceId }); }}
                     className={`p-2 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all ${item.done ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                   >
                     <ArrowRight size={18} />
                   </button>
                   <button 
                     onClick={(e) => deleteItem(e, item.id)}
                     className={`p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all ${item.done ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                   >
                     <X size={18} />
                    </button>
                  </div>
                )})
            )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-white/0 pt-10">
          <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-full shadow-lg border border-gray-100">
            <input 
              value={newItemInput}
              onChange={(e) => setNewItemInput(e.target.value)}
              placeholder={`Zu ${activeList.name} hinzufügen...`}
              onKeyDown={(e) => e.key === 'Enter' && addItemToList()}
              className="flex-1 bg-transparent px-6 py-3 outline-none text-gray-800 placeholder-gray-400"
            />
            <button onClick={addItemToList} className="w-12 h-12 bg-indigo-600 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 hover:bg-indigo-700 transition-colors">
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl mb-20 sm:mb-0">
              <h3 className="text-lg font-semibold mb-4">Neue Liste erstellen</h3>
              {newListName.trim() && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-2xl">
                  <StoreIcon name={newListName.trim()} size="w-12 h-12" />
                  <div>
                    <div className="font-medium text-gray-800">{newListName.trim()}</div>
                    <div className="text-xs text-gray-400">Vorschau</div>
                  </div>
                </div>
              )}
              <input 
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNewList()}
                placeholder="Name (z.B. Ikea, Baumarkt)"
                className="w-full bg-gray-100 px-4 py-3 rounded-xl outline-none mb-4 focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex gap-3">
                 <button 
                   onClick={closeCreateModal}
                   className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium"
                 >
                   Abbrechen
                 </button>
                 <button 
                   onClick={addNewList}
                   disabled={!newListName.trim()}
                   className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:shadow-none"
                 >
                   Erstellen
                 </button>
              </div>
           </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl mb-20 sm:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Liste löschen?</h3>
                <p className="text-sm text-gray-500">
                  &bdquo;{lists.find(l => l.id === deleteConfirmId)?.name}&ldquo; wird dauerhaft entfernt.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium shadow-lg shadow-red-200"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {moveItemState && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl mb-20 sm:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <ArrowRight size={22} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Artikel verschieben</h3>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {lists.find(l => l.id === moveItemState.sourceId)?.items.find(i => i.id === moveItemState.id)?.text}
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {lists.filter(l => l.id !== 'general' && l.id !== moveItemState.sourceId).map(l => (
                <button
                  key={l.id}
                  onClick={() => moveItemToList(l.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 transition-colors text-left"
                >
                  <StoreIcon name={l.name} brandDomain={l.brandDomain} size="w-10 h-10" />
                  <span className="font-medium text-gray-800">{l.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setMoveItemState(null)}
              className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FinanceView = ({ onBack }) => (
  <div className="animate-fade-in">
    <Header title="Finanzen" onBack={onBack} />
    <div className="px-4">
      <div className="bg-emerald-100 rounded-3xl p-6 mb-6 text-emerald-900">
        <div className="text-sm opacity-70">Aktuelles Haushaltsbudget</div>
        <div className="text-4xl font-semibold mt-1">€ {FINANCE_DATA.balance.toFixed(2)}</div>
      </div>
      
      <h3 className="text-lg font-medium mb-4 px-2">Letzte Umsätze</h3>
      <div className="space-y-3">
        {FINANCE_DATA.transactions.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-800">{t.title}</div>
              <div className="text-xs text-gray-500">{t.date}</div>
            </div>
            <div className={`font-semibold ${t.amount < 0 ? 'text-gray-800' : 'text-emerald-600'}`}>
              {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} €
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TrashView = ({ onBack }) => {
  const [selectedType, setSelectedType] = useState(null);

  if (selectedType) {
    const item = TRASH_SCHEDULE.find(s => s.type === selectedType);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const futureDates = item.dates
      .map(([y, m, d]) => new Date(y, m, d))
      .filter(dt => dt >= today);
    return (
      <div className="animate-fade-in">
        <Header title={selectedType} onBack={() => setSelectedType(null)} />
        <div className="px-4 grid gap-3">
          {futureDates.map((dt, idx) => {
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const diff = Math.round((dt - today) / 86400000);
            const daysLabel = diff === 0 ? 'Heute' : diff === 1 ? 'Morgen' : `in ${diff} Tagen`;
            return (
              <div key={idx} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                <div className="font-medium">{WEEKDAY_ABBR[dt.getDay()]}, {dd}.{mm}.{dt.getFullYear()}</div>
                <div className="text-sm text-gray-500">{daysLabel}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header title="Müllabfuhr" onBack={onBack} />
      <div className="px-4 grid grid-cols-2 gap-3">
        {TRASH_SCHEDULE.map((item, idx) => {
          const days = getDaysUntil(item.dates);
          const daysLabel = days === null ? '—' : days === 0 ? 'Heute' : days === 1 ? 'Morgen' : `in ${days} Tagen`;
          return (
            <div
              key={idx}
              onClick={() => setSelectedType(item.type)}
              className="relative overflow-hidden group p-5 rounded-3xl bg-white hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between h-36"
            >
              <div className={`absolute top-0 right-0 p-20 rounded-full opacity-5 translate-x-8 -translate-y-8 ${item.color}`}></div>
              <div className="flex justify-between items-start z-10">
                <div className={`p-3 rounded-2xl ${item.color} bg-opacity-20 text-gray-800`}>
                  <Trash2 size={24} className="text-gray-900 opacity-80" />
                </div>
              </div>
              <div className="z-10">
                <h3 className="text-lg font-medium text-gray-800 leading-tight">{item.type}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.date} · {daysLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarView = ({ onBack }) => (
  <div className="animate-fade-in">
    <Header title="Familienkalender" onBack={onBack} />
    <div className="px-4">
        <div className="bg-white rounded-3xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">Oktober 2025</span>
                <div className="flex gap-2">
                    <span className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={16}/></span>
                    <span className="p-2 bg-gray-100 rounded-full rotate-180"><ArrowLeft size={16}/></span>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-400">
                <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
                {[...Array(31)].map((_, i) => (
                    <div key={i} className={`aspect-square flex items-center justify-center rounded-full ${i === 26 ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                        {i + 1}
                    </div>
                ))}
            </div>
        </div>
        
        <h3 className="text-lg font-medium mb-3 px-2">Kommende Termine</h3>
        <div className="space-y-3">
             <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl">
                <div className="text-orange-900 font-semibold">Elternabend Schule</div>
                <div className="text-orange-700/70 text-sm">Heute, 19:00 Uhr</div>
             </div>
             <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                <div className="text-blue-900 font-semibold">Fußballtraining Max</div>
                <div className="text-blue-700/70 text-sm">Morgen, 16:30 Uhr</div>
             </div>
        </div>
    </div>
  </div>
);

const TaskView = ({ onBack }) => {
    const [tasks, setTasks] = useState(() => {
        try {
            const saved = localStorage.getItem('family_app_tasks');
            return saved ? JSON.parse(saved) : INITIAL_TASKS;
        } catch {
            return INITIAL_TASKS;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('family_app_tasks', JSON.stringify(tasks));
        } catch {
            // storage quota exceeded or unavailable – ignore
        }
    }, [tasks]);
    
    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? {...t, done: !t.done} : t));
    };

    return (
        <div className="animate-fade-in">
            <Header title="Aufgaben" onBack={onBack} />
            <div className="px-4 space-y-3">
                {tasks.map(t => (
                    <div key={t.id} onClick={() => toggleTask(t.id)} className="bg-white p-4 rounded-2xl flex items-center gap-4 cursor-pointer">
                         <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${t.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {t.done && <Check size={14} className="text-white" />}
                         </div>
                         <div className="flex-1">
                             <div className={`font-medium ${t.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.text}</div>
                             <div className="text-xs px-2 py-0.5 bg-gray-100 inline-block rounded-md mt-1 text-gray-500">{t.assign}</div>
                         </div>
                    </div>
                ))}
            </div>
            <FAB icon={Plus} onClick={() => {}} />
        </div>
    );
};

const PlaceholderView = ({ title, icon: Icon, onBack, color }) => (
  <div className="animate-fade-in h-full flex flex-col">
    <Header title={title} onBack={onBack} />
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
      <div className={`p-6 rounded-full ${color} bg-opacity-10 mb-6`}>
        <Icon size={48} className={color.replace('bg-', 'text-')} />
      </div>
      <p>Hier entsteht der Bereich für {title}.</p>
    </div>
  </div>
);

const PackingView = ({ onBack }) => {
  const [lists, setLists] = useState(() => {
    try {
      const saved = localStorage.getItem('family_app_packing_lists');
      return saved ? JSON.parse(saved) : INITIAL_PACKING_LISTS;
    } catch {
      return INITIAL_PACKING_LISTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('family_app_packing_lists', JSON.stringify(lists));
    } catch {}
  }, [lists]);

  const [activeListId, setActiveListId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editListId, setEditListId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [modalName, setModalName] = useState('');
  const [newItemInput, setNewItemInput] = useState('');

  const addList = () => {
    const trimmed = modalName.trim();
    if (!trimmed) return;
    const newList = {
      id: crypto.randomUUID(),
      name: trimmed,
      color: PACKING_COLORS[lists.length % PACKING_COLORS.length],
      items: [],
    };
    setLists(prev => [...prev, newList]);
    setShowCreateModal(false);
    setModalName('');
  };

  const saveListName = () => {
    const trimmed = modalName.trim();
    if (!trimmed || !editListId) return;
    setLists(prev => prev.map(l => l.id === editListId ? { ...l, name: trimmed } : l));
    setEditListId(null);
    setModalName('');
  };

  const confirmDeleteList = () => {
    setLists(prev => prev.filter(l => l.id !== deleteConfirmId));
    if (activeListId === deleteConfirmId) setActiveListId(null);
    setDeleteConfirmId(null);
  };

  const toggleItem = (itemId) => {
    setLists(prev => prev.map(list => {
      if (list.id !== activeListId) return list;
      return { ...list, items: list.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) };
    }));
  };

  const addItem = () => {
    if (!newItemInput.trim()) return;
    setLists(prev => prev.map(list => {
      if (list.id !== activeListId) return list;
      return { ...list, items: [...list.items, { id: Date.now(), text: newItemInput.trim(), done: false }] };
    }));
    setNewItemInput('');
  };

  const deleteItem = (e, itemId) => {
    e.stopPropagation();
    setLists(prev => prev.map(list => {
      if (list.id !== activeListId) return list;
      return { ...list, items: list.items.filter(i => i.id !== itemId) };
    }));
  };

  const activeList = lists.find(l => l.id === activeListId);

  // Detail View
  if (activeList) {
    const doneCount = activeList.items.filter(i => i.done).length;
    return (
      <div className="animate-fade-in flex flex-col h-full bg-gray-50 min-h-screen">
        <Header title={activeList.name} onBack={() => setActiveListId(null)} />

        <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col relative z-20 mt-4">
          <div className="p-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${activeList.color} bg-opacity-20`}>
                <Backpack size={24} className="text-gray-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">{activeList.name}</h2>
                <span className="text-xs text-gray-500 font-medium">{doneCount}/{activeList.items.length} gepackt</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2 mt-2">
            {activeList.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300 mt-4">
                <Backpack size={40} className="mb-2 opacity-20" />
                <p className="text-sm">Noch nichts auf der Liste</p>
              </div>
            ) : (
              activeList.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="group flex items-center p-4 rounded-2xl transition-all duration-200 cursor-pointer border bg-white border-gray-100 shadow-sm"
                >
                  <div className={`w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center transition-colors ${item.done ? 'border-gray-300 bg-gray-300' : 'border-indigo-400'}`}>
                    {item.done && <Check size={16} className="text-white" />}
                  </div>
                  <span className={`flex-1 font-medium ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={(e) => deleteItem(e, item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-white/0 pt-10">
            <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-full shadow-lg border border-gray-100">
              <input
                value={newItemInput}
                onChange={e => setNewItemInput(e.target.value)}
                placeholder={`Zu ${activeList.name} hinzufügen...`}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                className="flex-1 bg-transparent px-6 py-3 outline-none text-gray-800 placeholder-gray-400"
              />
              <button onClick={addItem} className="w-12 h-12 bg-indigo-600 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 hover:bg-indigo-700 transition-colors">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview
  return (
    <div className="animate-fade-in min-h-screen bg-gray-50">
      <Header title="Packlisten" onBack={onBack} />

      <div className="px-4 py-2 grid grid-cols-2 gap-3 pb-24">
        {lists.map(list => {
          const doneCount = list.items.filter(i => i.done).length;
          return (
            <div key={list.id} className="relative">
              <div
                onClick={() => setActiveListId(list.id)}
                className="relative overflow-hidden p-5 rounded-3xl bg-white hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between h-36"
              >
                <div className={`absolute top-0 right-0 p-20 rounded-full opacity-5 translate-x-8 -translate-y-8 ${list.color}`}></div>
                <div className="flex justify-between items-start z-10">
                  <div className={`p-3 rounded-2xl ${list.color} bg-opacity-20 text-gray-800`}>
                    <Backpack size={24} className="text-gray-900 opacity-80" />
                  </div>
                </div>
                <div className="z-10">
                  <h3 className="text-lg font-medium text-gray-800 leading-tight">{list.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {list.items.length === 0 ? 'Keine Artikel' : `${doneCount}/${list.items.length} gepackt`}
                  </p>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setModalName(list.name); setEditListId(list.id); }}
                  className="w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(list.id); }}
                  className="w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <FAB icon={Plus} onClick={() => { setModalName(''); setShowCreateModal(true); }} />

      {showCreateModal && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl mb-20 sm:mb-0">
            <h3 className="text-lg font-semibold mb-4">Neue Packliste erstellen</h3>
            <input
              value={modalName}
              onChange={e => setModalName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addList()}
              placeholder="Name (z.B. Sommerurlaub)"
              className="w-full bg-gray-100 px-4 py-3 rounded-xl outline-none mb-4 focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowCreateModal(false); setModalName(''); }} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">
                Abbrechen
              </button>
              <button onClick={addList} disabled={!modalName.trim()} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:shadow-none">
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {editListId && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl mb-20 sm:mb-0">
            <h3 className="text-lg font-semibold mb-4">Liste umbenennen</h3>
            <input
              value={modalName}
              onChange={e => setModalName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveListName()}
              placeholder="Name"
              className="w-full bg-gray-100 px-4 py-3 rounded-xl outline-none mb-4 focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setEditListId(null); setModalName(''); }} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">
                Abbrechen
              </button>
              <button onClick={saveListName} disabled={!modalName.trim()} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:shadow-none">
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl mb-20 sm:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Liste löschen?</h3>
                <p className="text-sm text-gray-500">
                  &bdquo;{lists.find(l => l.id === deleteConfirmId)?.name}&ldquo; wird dauerhaft entfernt.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">
                Abbrechen
              </button>
              <button onClick={confirmDeleteList} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium shadow-lg shadow-red-200">
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardTile = ({ icon: Icon, title, subtitle, color, onClick, span = "col-span-1" }) => (
  <div 
    onClick={onClick}
    className={`relative overflow-hidden group p-5 rounded-3xl bg-white hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between h-36 ${span}`}
  >
    <div className={`absolute top-0 right-0 p-20 rounded-full opacity-5 translate-x-8 -translate-y-8 ${color}`}></div>
    
    <div className="flex justify-between items-start z-10">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20 text-gray-800`}>
        <Icon size={24} className="text-gray-900 opacity-80" />
      </div>
    </div>
    
    <div className="z-10">
      <h3 className="text-lg font-medium text-gray-800 leading-tight">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1 truncate">{subtitle}</p>}
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dayOffset, setDayOffset] = useState(0);

  useEffect(() => {
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.replaceState({ view: 'dashboard' }, '', currentUrl);
    const handlePopState = (event) => {
      setCurrentView(event.state?.view || 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (window.history.state?.view === currentView) {
      return;
    }
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentView === 'dashboard') {
      window.history.replaceState({ view: 'dashboard' }, '', currentUrl);
      return;
    }
    window.history.pushState({ view: currentView }, '', currentUrl);
  }, [currentView]);
  
  const renderView = () => {
    switch(currentView) {
      case 'shopping': return <ShoppingView onBack={() => setCurrentView('dashboard')} />;
      case 'finance': return <FinanceView onBack={() => setCurrentView('dashboard')} />;
      case 'trash': return <TrashView onBack={() => setCurrentView('dashboard')} />;
      case 'calendar': return <CalendarView onBack={() => setCurrentView('dashboard')} />;
      case 'tasks': return <TaskView onBack={() => setCurrentView('dashboard')} />;
      case 'packages': return <PlaceholderView title="Paketverfolgung" icon={Package} color="bg-amber-500" onBack={() => setCurrentView('dashboard')} />;
      case 'weather': return <PlaceholderView title="Wetter Details" icon={CloudSun} color="bg-sky-500" onBack={() => setCurrentView('dashboard')} />;
      case 'packing': return <PackingView onBack={() => setCurrentView('dashboard')} />;
      case 'orga': return <PlaceholderView title="Organisation" icon={FolderOpen} color="bg-purple-500" onBack={() => setCurrentView('dashboard')} />;
      default: return null;
    }
  };

  if (currentView !== 'dashboard') {
    return <div className="min-h-screen bg-gray-50 font-sans text-gray-900 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {renderView()}
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans text-gray-900 flex justify-center">
      <div className="w-full max-w-md bg-[#fdfdfd] min-h-screen shadow-2xl overflow-y-auto">
        
        <DailyOverviewTile 
            offset={dayOffset} 
            setOffset={setDayOffset} 
            onWeatherClick={() => setCurrentView('weather')}
        />

        <div className="px-4 py-2 grid grid-cols-2 gap-3 pb-24">
            
            <DashboardTile 
                onClick={() => setCurrentView('shopping')}
                icon={ShoppingCart}
                title="Einkauf"
                subtitle="3 Listen aktiv"
                color="bg-indigo-400"
            />

            <DashboardTile 
                onClick={() => setCurrentView('calendar')}
                icon={Calendar}
                title="Kalender"
                subtitle="Elternabend 19:00"
                color="bg-red-400"
            />

            <DashboardTile 
                onClick={() => setCurrentView('tasks')}
                icon={CheckSquare}
                title="Aufgaben"
                subtitle="Max: Spülmaschine"
                color="bg-green-500"
            />

            <DashboardTile 
                onClick={() => setCurrentView('finance')}
                icon={Wallet}
                title="Finanzen"
                subtitle="Budget OK"
                color="bg-emerald-500"
            />

            <DashboardTile 
                onClick={() => setCurrentView('trash')}
                icon={Trash2}
                title="Müll"
                subtitle={getNextTrashSummary()}
                color="bg-gray-600"
            />

            <DashboardTile 
                onClick={() => setCurrentView('packages')}
                icon={Package}
                title="Pakete"
                subtitle="2 unterwegs"
                color="bg-amber-500"
            />

             <DashboardTile 
                onClick={() => setCurrentView('packing')}
                icon={Backpack}
                title="Packliste"
                subtitle="Urlaub Herbst"
                color="bg-rose-400"
            />

             <DashboardTile 
                onClick={() => setCurrentView('orga')}
                icon={FolderOpen}
                title="Orga"
                subtitle="Docs & Kontakte"
                color="bg-purple-400"
            />
        </div>

      </div>
    </div>
  );
}
