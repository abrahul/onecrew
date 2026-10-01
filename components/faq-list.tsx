import { faqs } from '@/lib/content';
export function FAQList() { return <div className="faq-list">{faqs.map(([q, a], i) => <details className="faq-item" key={q} open={i === 0}><summary><span>{q}</span><b aria-hidden="true">+</b></summary><p>{a}</p></details>)}</div>; }
