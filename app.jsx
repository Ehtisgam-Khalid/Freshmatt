import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

const api = async (url, opts = {}) => {
    const res = await fetch('/api' + url, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        ...opts,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data.message || 'Kuch masla ho gaya');
        err.errors = data.errors;
        throw err;
    }
    return data;
};

const money = (n) => 'Rs. ' + Number(n).toLocaleString('en-PK', { maximumFractionDigits: 0 });

function useCart() {
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem('fm_cart')) || {}; } catch { return {}; }
    });
    useEffect(() => localStorage.setItem('fm_cart', JSON.stringify(cart)), [cart]);

    const add = (p) => setCart((c) => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty || 0) + 1 } }));
    const dec = (id) => setCart((c) => {
        const n = { ...c };
        if (!n[id]) return n;
        if (n[id].qty <= 1) delete n[id]; else n[id] = { ...n[id], qty: n[id].qty - 1 };
        return n;
    });
    const remove = (id) => setCart((c) => { const n = { ...c }; delete n[id]; return n; });
    const clear = () => setCart({});
    const items = Object.values(cart);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.product.price, 0);
    return { cart, items, count, subtotal, add, dec, remove, clear };
}

function Header({ count, search, setSearch, openCart, go }) {
    return (
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-brand-100">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
                <button onClick={() => go('shop')} className="flex items-center gap-2 text-xl font-extrabold text-brand-700">
                    <span className="text-2xl">🛒</span> Fresh<span className="text-accent">Mart</span>
                </button>
                <input
                    className="input hidden flex-1 md:block"
                    placeholder="Search karein... (tomato, milk, rice)"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); go('shop'); }}
                />
                <div className="ml-auto flex items-center gap-2">
                    <button className="btn btn-ghost hidden sm:inline-flex" onClick={() => go('track')}>📦 Track</button>
                    <button className="btn btn-primary relative" onClick={openCart}>
                        🛍️ Cart
                        {count > 0 && (
                            <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-bold text-white">{count}</span>
                        )}
                    </button>
                </div>
            </div>
            <div className="px-4 pb-3 md:hidden">
                <input className="input" placeholder="Search karein..." value={search}
                    onChange={(e) => { setSearch(e.target.value); go('shop'); }} />
            </div>
        </header>
    );
}

function Hero({ settings }) {
    return (
        <section className="bg-gradient-to-br from-brand-600 to-brand-900 text-white">
            <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 md:grid-cols-2 md:py-14">
                <div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">🚚 Same day delivery</span>
                    <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">Taza grocery,<br />seedha aapke ghar tak</h1>
                    <p className="mt-3 text-brand-100">
                        Fruits, sabziyan, dairy aur roz marra ka saman. {settings && <>{money(settings.free_delivery_above)} se upar delivery free!</>}
                    </p>
                    <a href="#products" className="btn mt-6 bg-accent text-white hover:bg-orange-600">Abhi shopping karein →</a>
                </div>
                <div className="grid grid-cols-4 gap-3 text-5xl md:text-6xl" aria-hidden>
                    {['🍎', '🥦', '🥛', '🍞', '🍌', '🥕', '🧀', '🍅'].map((e, i) => (
                        <div key={i} className="grid aspect-square place-items-center rounded-2xl bg-white/15 backdrop-blur">{e}</div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ p, qty, add, dec }) {
    return (
        <div className="flex flex-col rounded-2xl border border-brand-100 bg-white p-3 shadow-sm transition hover:shadow-md">
            <div className="relative grid aspect-[4/3] place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-6xl">
                {p.emoji}
                {p.featured && <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">POPULAR</span>}
            </div>
            <div className="mt-3 flex-1">
                <h3 className="text-sm font-semibold leading-snug">{p.name}</h3>
                <p className="text-xs text-slate-500">{p.unit}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-brand-700">{money(p.price)}</span>
                {qty ? (
                    <div className="flex items-center gap-2 rounded-xl bg-brand-100 px-1">
                        <button className="h-8 w-8 text-lg font-bold text-brand-700" onClick={() => dec(p.id)}>−</button>
                        <span className="w-4 text-center text-sm font-bold">{qty}</span>
                        <button className="h-8 w-8 text-lg font-bold text-brand-700" onClick={() => add(p)}>+</button>
                    </div>
                ) : (
                    <button className="btn btn-primary px-3! py-1.5!" onClick={() => add(p)}>Add +</button>
                )}
            </div>
        </div>
    );
}

function Shop({ categories, products, loading, activeCat, setActiveCat, cart, add, dec, settings }) {
    return (
        <>
            <Hero settings={settings} />
            <main id="products" className="mx-auto max-w-6xl px-4 py-8">
                <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2">
                    <button onClick={() => setActiveCat('')} className={`btn shrink-0 ${activeCat === '' ? 'btn-primary' : 'btn-ghost'}`}>🛒 Sab</button>
                    {categories.map((c) => (
                        <button key={c.id} onClick={() => setActiveCat(c.slug)}
                            className={`btn shrink-0 ${activeCat === c.slug ? 'btn-primary' : 'btn-ghost'}`}>
                            {c.emoji} {c.name}
                        </button>
                    ))}
                </div>
                {loading ? (
                    <p className="py-20 text-center text-slate-500">Loading...</p>
                ) : products.length === 0 ? (
                    <p className="py-20 text-center text-slate-500">Koi product nahi mila 😕</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                        {products.map((p) => <ProductCard key={p.id} p={p} qty={cart[p.id]?.qty} add={add} dec={dec} />)}
                    </div>
                )}
            </main>
        </>
    );
}

function CartDrawer({ open, close, c, settings, checkout }) {
    const fee = c.subtotal === 0 ? 0 : c.subtotal >= settings.free_delivery_above ? 0 : settings.delivery_fee;
    const need = settings.free_delivery_above - c.subtotal;
    return (
        <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
            <div onClick={close} className={`absolute inset-0 bg-black/40 transition ${open ? 'opacity-100' : 'opacity-0'}`} />
            <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-bold">🛍️ Aapki Cart ({c.count})</h2>
                    <button onClick={close} className="text-2xl">×</button>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {c.items.length === 0 && <p className="py-16 text-center text-slate-500">Cart khali hai 🛒</p>}
                    {c.items.map(({ product: p, qty }) => (
                        <div key={p.id} className="flex items-center gap-3 rounded-xl border border-brand-100 p-2">
                            <div className="grid h-14 w-14 place-items-center rounded-lg bg-brand-50 text-3xl">{p.emoji}</div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{p.name}</p>
                                <p className="text-xs text-slate-500">{money(p.price)} / {p.unit}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <button className="h-6 w-6 rounded bg-brand-100 font-bold" onClick={() => c.dec(p.id)}>−</button>
                                    <span className="text-sm font-bold">{qty}</span>
                                    <button className="h-6 w-6 rounded bg-brand-100 font-bold" onClick={() => c.add(p)}>+</button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">{money(p.price * qty)}</p>
                                <button className="text-xs text-red-500" onClick={() => c.remove(p.id)}>Hatao</button>
                            </div>
                        </div>
                    ))}
                </div>
                {c.items.length > 0 && (
                    <div className="space-y-2 border-t p-4 text-sm">
                        {need > 0 && <p className="rounded-lg bg-orange-50 p-2 text-xs text-orange-700">Aur {money(need)} ka saman add karein, delivery free ho jayegi! 🚚</p>}
                        <div className="flex justify-between"><span>Subtotal</span><span>{money(c.subtotal)}</span></div>
                        <div className="flex justify-between"><span>Delivery</span><span>{fee === 0 ? 'FREE' : money(fee)}</span></div>
                        <div className="flex justify-between text-base font-bold"><span>Total</span><span>{money(c.subtotal + fee)}</span></div>
                        <button className="btn btn-primary w-full" onClick={checkout}>Checkout karein →</button>
                    </div>
                )}
            </aside>
        </div>
    );
}

function Field({ label, error, type = 'text', ...rest }) {
    return (
        <label className="block text-sm font-medium">
            {label}
            <input className="input mt-1" type={type} {...rest} />
            {error && <span className="text-xs text-red-500">{error[0]}</span>}
        </label>
    );
}

function Checkout({ c, settings, onDone, back }) {
    const [f, setF] = useState({ customer_name: '', phone: '', email: '', address: '', city: '', notes: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const fee = c.subtotal >= settings.free_delivery_above ? 0 : settings.delivery_fee;
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true); setError(''); setErrors({});
        try {
            const order = await api('/orders', {
                method: 'POST',
                body: JSON.stringify({ ...f, items: c.items.map((i) => ({ product_id: i.product.id, quantity: i.qty })) }),
            });
            c.clear();
            onDone(order);
        } catch (err) {
            setError(err.message); setErrors(err.errors || {});
        } finally { setBusy(false); }
    };

    if (c.items.length === 0) {
        return <div className="py-24 text-center"><p>Cart khali hai.</p><button className="btn btn-primary mt-4" onClick={back}>Shopping karein</button></div>;
    }

    return (
        <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-5">
            <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm md:col-span-3">
                <h2 className="text-xl font-bold">📍 Delivery Details</h2>
                <Field label="Poora naam *" required value={f.customer_name} onChange={set('customer_name')} error={errors.customer_name} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone *" required placeholder="03XX-XXXXXXX" value={f.phone} onChange={set('phone')} error={errors.phone} />
                    <Field label="Email (optional)" type="email" value={f.email} onChange={set('email')} error={errors.email} />
                </div>
                <Field label="Shehar *" required value={f.city} onChange={set('city')} error={errors.city} />
                <label className="block text-sm font-medium">Poora address *
                    <textarea className="input mt-1" rows="3" required value={f.address} onChange={set('address')} />
                    {errors.address && <span className="text-xs text-red-500">{errors.address[0]}</span>}
                </label>
                <label className="block text-sm font-medium">Notes (optional)
                    <textarea className="input mt-1" rows="2" value={f.notes} onChange={set('notes')} />
                </label>
                <div className="rounded-xl bg-brand-50 p-3 text-sm">💵 Payment: <b>Cash on Delivery</b></div>
                {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
                <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Order ho raha hai...' : 'Order Place Karein ✅'}</button>
            </form>
            <aside className="h-fit space-y-2 rounded-2xl bg-white p-5 text-sm shadow-sm md:col-span-2">
                <h3 className="text-lg font-bold">Order Summary</h3>
                {c.items.map(({ product: p, qty }) => (
                    <div key={p.id} className="flex justify-between"><span>{p.emoji} {p.name} × {qty}</span><span>{money(p.price * qty)}</span></div>
                ))}
                <hr />
                <div className="flex justify-between"><span>Subtotal</span><span>{money(c.subtotal)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{fee === 0 ? 'FREE' : money(fee)}</span></div>
                <div className="flex justify-between text-base font-bold"><span>Total</span><span>{money(c.subtotal + fee)}</span></div>
            </aside>
        </main>
    );
}

function Success({ order, go }) {
    return (
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
            <div className="text-7xl">🎉</div>
            <h2 className="mt-4 text-2xl font-extrabold text-brand-700">Order place ho gaya!</h2>
            <p className="mt-2 text-slate-600">Shukriya {order.customer_name}! Hum jald aap se rabta karenge.</p>
            <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Order Number</p>
                <p className="text-2xl font-bold tracking-wider">{order.order_number}</p>
                <p className="mt-3 text-sm text-slate-500">Total (COD)</p>
                <p className="text-xl font-bold text-brand-700">{money(order.total)}</p>
            </div>
            <button className="btn btn-primary mt-6" onClick={() => go('shop')}>Dobara shopping karein</button>
        </main>
    );
}

function Track({ initial = '' }) {
    const [num, setNum] = useState(initial);
    const [res, setRes] = useState(null);
    const [err, setErr] = useState('');
    const steps = ['pending', 'confirmed', 'out_for_delivery', 'delivered'];
    const labels = { pending: 'Received', confirmed: 'Confirmed', out_for_delivery: 'On the way', delivered: 'Delivered' };
    const find = async (e) => {
        e.preventDefault(); setErr(''); setRes(null);
        try { setRes(await api('/orders/' + encodeURIComponent(num.trim()))); } catch { setErr('Order nahi mila. Number check karein.'); }
    };
    return (
        <main className="mx-auto max-w-lg px-4 py-12">
            <h2 className="text-xl font-bold">📦 Order Track Karein</h2>
            <form onSubmit={find} className="mt-4 flex gap-2">
                <input className="input" placeholder="FM-240101-ABCDE" value={num} onChange={(e) => setNum(e.target.value)} required />
                <button className="btn btn-primary">Find</button>
            </form>
            {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
            {res && (
                <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                    <p className="font-bold">{res.order_number}</p>
                    <div className="mt-4 flex justify-between text-center text-xs">
                        {steps.map((s, i) => (
                            <div key={s} className={`flex-1 ${i <= steps.indexOf(res.status) ? 'font-bold text-brand-700' : 'text-slate-400'}`}>
                                <div className="text-2xl">{i <= steps.indexOf(res.status) ? '✅' : '⚪'}</div>{labels[s]}
                            </div>
                        ))}
                    </div>
                    <ul className="mt-4 space-y-1 text-sm">
                        {res.items.map((i) => <li key={i.id} className="flex justify-between"><span>{i.product_name} × {i.quantity}</span><span>{money(i.line_total)}</span></li>)}
                    </ul>
                    <p className="mt-3 text-right font-bold">Total: {money(res.total)}</p>
                </div>
            )}
        </main>
    );
}

function Footer() {
    return (
        <footer className="mt-10 bg-brand-900 py-8 text-center text-sm text-brand-100">
            <p className="text-lg font-bold">🛒 FreshMart</p>
            <p className="mt-1">Taza grocery, sasti qeemat, tez delivery.</p>
            <p className="mt-3 text-xs opacity-70">© {new Date().getFullYear()} FreshMart. All rights reserved.</p>
        </footer>
    );
}

function App() {
    const [view, setView] = useState('shop');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState({ delivery_fee: 150, free_delivery_above: 3000 });
    const [activeCat, setActiveCat] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [cartOpen, setCartOpen] = useState(false);
    const [order, setOrder] = useState(null);
    const c = useCart();

    useEffect(() => {
        api('/categories').then(setCategories).catch(() => {});
        api('/settings').then(setSettings).catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => {
            const qs = new URLSearchParams();
            if (activeCat) qs.set('category', activeCat);
            if (search) qs.set('search', search);
            api('/products?' + qs).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
        }, 250);
        return () => clearTimeout(t);
    }, [activeCat, search]);

    const go = (v) => { setView(v); window.scrollTo(0, 0); };
    const qtyMap = useMemo(() => c.cart, [c.cart]);

    return (
        <div className="min-h-screen">
            <Header count={c.count} search={search} setSearch={setSearch} openCart={() => setCartOpen(true)} go={go} />
            {view === 'shop' && <Shop {...{ categories, products, loading, activeCat, setActiveCat, settings }} cart={qtyMap} add={c.add} dec={c.dec} />}
            {view === 'checkout' && <Checkout c={c} settings={settings} back={() => go('shop')} onDone={(o) => { setOrder(o); go('success'); }} />}
            {view === 'success' && order && <Success order={order} go={go} />}
            {view === 'track' && <Track initial={order?.order_number || ''} />}
            <Footer />
            <CartDrawer open={cartOpen} close={() => setCartOpen(false)} c={c} settings={settings}
                checkout={() => { setCartOpen(false); go('checkout'); }} />
        </div>
    );
}

createRoot(document.getElementById('root')).render(<App />);
