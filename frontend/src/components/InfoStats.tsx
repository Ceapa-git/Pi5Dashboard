import "./InfoStats.css";

export type InfoItem = {
  label: string;
  value: string;
};

type Props = {
  title?: string;
  items: InfoItem[];
};

export default function InfoStats({ title, items }: Props) {
  return (
    <div className="info-card">
      {title && <h3 className="info-title">{title}</h3>}

      <div className="info-grid">
        {items.map((item, i) => (
          <div key={i} className="info-row">
            <span className="info-label">{item.label}</span>
            <span className="info-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

