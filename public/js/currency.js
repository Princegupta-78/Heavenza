// public/js/currency.js

// Symbols for display
const SYMBOL = { INR: "₹", USD: "$", EUR: "€" };

// Keep selected currency across pages
const STORAGE_KEY = "selectedCurrency";

// Fetch live rates (free, no key) with INR as base
async function getRates() {
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=INR");
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();
    // We only care about a few currencies
    return {
      INR: 1,
      USD: data.rates?.USD ?? 0.012,
      EUR: data.rates?.EUR ?? 0.011,
    };
  } catch (e) {
    // Fallback static rates if API fails
    return { INR: 1, USD: 0.012, EUR: 0.011 };
  }
}

function formatCurrency(amount, code) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code })
      .format(amount);
  } catch {
    // Fallback to symbol + number if locale/currency unsupported
    return `${SYMBOL[code] || ""} ${amount.toFixed(2)}`;
  }
}

async function applyCurrency(code) {
  const rates = await getRates();
  const rate = rates[code] ?? 1;

  document.querySelectorAll(".price").forEach((el) => {
    const baseInINR = parseFloat(el.getAttribute("data-price") || "0");
    const converted = baseInINR * rate;
    el.innerText = `${formatCurrency(converted, code)} / night`;
  });
}

function initCurrencySwitcher() {
  const select = document.getElementById("currencySwitcher");
  if (!select) return;

  // initialize from storage or default to INR
  const saved = localStorage.getItem(STORAGE_KEY) || "INR";
  if ([...select.options].some(o => o.value === saved)) {
    select.value = saved;
  }

  // initial apply
  applyCurrency(select.value);

  // update on change
  select.addEventListener("change", (e) => {
    const value = e.target.value;
    localStorage.setItem(STORAGE_KEY, value);
    applyCurrency(value);
  });
}

// Run after DOM is ready
document.addEventListener("DOMContentLoaded", initCurrencySwitcher);
