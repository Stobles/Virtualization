import { useVirtualized } from "./hooks/useVirtualized";

const itemsArr = Array.from({ length: 10000 }, (_, index) => ({
  id: index,
  text: String(index),
}));

const containerHeight = 750;
const itemHeight = 40;
const overscan = 5;

function App() {
  const { virtualItems, totalListHeight, scrollElementRef, setItems } =
    useVirtualized<{ id: number; text: string }>(itemsArr, {
      containerHeight,
      itemHeight,
      overscan,
    });
  return (
    <div className="flex justify-center">
      <div className="w-full space-y-2.5 max-w-[1200px] py-20">
        <h1 className="text-3xl">Список элементов</h1>
        <button
          className="border border-blue-300 p-2 cursor-pointer"
          onClick={() => {
            setItems((items) => items.slice().reverse());
          }}
        >
          Reverse список
        </button>
        <ul
          ref={scrollElementRef}
          style={{ height: containerHeight }}
          className={`w-full overflow-auto`}
        >
          <div className="relative" style={{ height: totalListHeight }}>
            {virtualItems.map(({ item, offsetTop }) => (
              <li
                key={item.id}
                className="absolute top-0"
                style={{
                  height: itemHeight,
                  transform: `translateY(${offsetTop}px)`,
                }}
              >
                {item.text}
              </li>
            ))}
          </div>
        </ul>
      </div>
    </div>
  );
}

export default App;
