const STEPS = ["Revisar y crear orden", "Pagar con Stripe", "Confirmación"];

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex flex-wrap gap-2 text-sm">
      {STEPS.map((step, index) => {
        const number = index + 1;
        const state = number < current ? "done" : number === current ? "current" : "todo";
        return (
          <li
            key={step}
            aria-current={state === "current" ? "step" : undefined}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
              state === "current"
                ? "border-indigo-600 bg-indigo-50 font-medium text-indigo-700"
                : state === "done"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 bg-white text-zinc-500"
            }`}
          >
            <span className="tabular-nums">{state === "done" ? "✓" : number}</span>
            {step}
          </li>
        );
      })}
    </ol>
  );
}
