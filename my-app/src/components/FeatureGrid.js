import { Bitcoin, ShieldCheck, Lock, BadgeCheck, Image as ImageIcon, Wallet2 } from 'lucide-react'

const FEATURES = [
  { icon: Bitcoin, color: 'text-amber-500', title: 'Зарплата в токенах', text: 'ETH, USDC, DAI та інші криптовалюти' },
  { icon: ShieldCheck, color: 'text-blue-600', title: 'DAO вакансії', text: 'Робота в децентралізованих організаціях' },
  { icon: Lock, color: 'text-green-600', title: 'Smart Contract Escrow', text: 'Гарантована оплата через смарт-контракти' },
  { icon: BadgeCheck, color: 'text-sky-500', title: 'On-chain репутація', text: 'Верифікація через ENS та blockchain' },
  { icon: ImageIcon, color: 'text-rose-500', title: 'NFT Portfolio', text: 'Покажи свої Web3 проекти' },
  { icon: Wallet2, color: 'text-amber-500', title: 'Wallet Login', text: 'Вхід через Web3 гаманець' },
]

export default function FeatureGrid() {
  return (
    <section id="features" className="card">
      <div className="border-b p-6">
        <h3 className="text-2xl">🌟 Унікальні можливості</h3>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-2">
        {FEATURES.map(({ icon: Icon, color, title, text }) => (
          <div
            key={title}
            className="group rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h5 className="mb-1 flex items-center gap-2 font-semibold">
              <Icon className={color} /> {title}
            </h5>
            <p className="text-gray-500">{text}</p>
            <div className="mt-3 h-1 w-0 rounded bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all group-hover:w-full" />
          </div>
        ))}
      </div>
    </section>
  )
}
