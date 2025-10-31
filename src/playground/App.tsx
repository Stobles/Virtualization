import { useCallback, useRef } from "react";
import { useVirtualized } from "@stoble/virtualization";
import { faker } from "@faker-js/faker";

const itemsArr = Array.from({ length: 10000 }, (_, index) => ({
  id: index,
  text: faker.lorem.paragraphs({ min: 2, max: 8 }),
}));

const overscan = 3;
const containerHeight = 750;

function App() {
  const scrollELRef = useRef<HTMLUListElement | null>(null);

  const { virtualItems, totalHeight, measureHeightRef, setItems } =
    useVirtualized<{
      id: number;
      text: string;
    }>(itemsArr, {
      overscan,
      getItemKey: (index) => `item-${index}`,
      getEstimateHeight: useCallback(() => 40, []),
      getScrollElement: useCallback(() => scrollELRef.current, []),
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
          ref={scrollELRef}
          style={{ height: containerHeight }}
          className={`w-full overflow-auto`}
        >
          <div className="relative" style={{ height: totalHeight }}>
            {virtualItems.map(({ index, offsetTop }) => {
              const item = itemsArr[index];

              return (
                <li
                  key={item.id}
                  ref={measureHeightRef}
                  data-index={item.id}
                  className="absolute top-0"
                  style={{
                    transform: `translateY(${offsetTop}px)`,
                    padding: "6px 12px",
                  }}
                >
                  {item.text}
                </li>
              );
            })}
          </div>
        </ul>
      </div>
    </div>
  );
}

export default App;
