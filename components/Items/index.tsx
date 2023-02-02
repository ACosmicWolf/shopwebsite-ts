import MakeItemsButton from "./MakeItems";
import PaintItemsButton from "./PaintItems";

export default function ItemsCard() {
  return (
    <div className="py-10">
      <div className="card bg-primary text-primary-content shadow-2xl">
        <div className="card-body">
          <h2 className="card-title">Items</h2>
          <MakeItemsButton />
          <PaintItemsButton />
        </div>
      </div>
    </div>
  );
}
