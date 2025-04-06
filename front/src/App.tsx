import "./App.css";
import { useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

type Item = {
  id: number;
  name: string;
  description: string;
  tags: string;
};

type Paginated<T> = {
  data: Array<T>;
  page: number;
  total_page: number;
  count: number;
};

function InfiniteScroll() {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<
    Array<Item & { imgSrc: string; imgWidth: number; imgHeigh: number }>
  >([]);
  const [columnCount, setColumnCount] = useState(6);
  const [totalPage, setTotalPage] = useState(1);
  const LIMIT = 20;
  const IMG_WIDTH = 230;

  const { isLoading } = useQuery<Array<Item>>({
    queryKey: ["items", page],
    queryFn: async () => {
      const data: Paginated<Item> = await fetch(
        `http://localhost:8000/items?page=${page}&limit=${LIMIT}`,
      ).then((response) => response.json());
      setAllData([
        ...allData,
        ...data.data.map((item) => {
          const imgHeigh = Math.round(Math.random() * 100 + 200);
          const imgWidth = Math.round(Math.random() * 100 + 400);
          return {
            ...item,
            imgHeigh,
            imgWidth,
            imgSrc: `https://picsum.photos/${imgHeigh}/${imgWidth}`,
          };
        }),
      ]);
      setTotalPage(data.total_page);
      return data.data;
    },
  });

  const checkForScrollEnd = () => {
    const hasVerticalScroll =
      document.documentElement.scrollHeight > window.innerHeight;
    const isScrollAtEnd =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 400;

    if (
      (isScrollAtEnd || !hasVerticalScroll) &&
      !isLoading &&
      page < totalPage
    ) {
      setPage(page + 1);
    }
  };

  const checkForColumnCount = () => {
    const width = window.innerWidth;
    if (width < IMG_WIDTH * 4) {
      setColumnCount(2);
    } else if (width < IMG_WIDTH * 5) {
      setColumnCount(3);
    } else if (width < IMG_WIDTH * 6) {
      setColumnCount(4);
    } else if (width < IMG_WIDTH * 7) {
      setColumnCount(5);
    } else {
      setColumnCount(6);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", checkForScrollEnd);
    window.addEventListener("resize", checkForScrollEnd);
    window.addEventListener("resize", checkForColumnCount);
    return () => {
      window.removeEventListener("scroll", checkForScrollEnd);
      window.removeEventListener("resize", checkForScrollEnd);
      window.removeEventListener("resize", checkForColumnCount);
    };
  }, [page, isLoading]);

  useEffect(() => {
    checkForColumnCount();
    checkForScrollEnd();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        overflow: "auto",
        overscrollBehavior: "contain",
        clear: "both",
      }}
    >
      {Array.from({ length: columnCount + 1 }).map((_, colIdx) => (
        <div key={colIdx} style={{ breakInside: "avoid" }}>
          {(allData || [])
            .filter((_, i) => i % columnCount === colIdx)
            .map((d) => {
              return (
                <div
                  key={d.id}
                  style={{
                    breakInside: "avoid",
                    width: "230px",
                    animation: "fadeIn 1s linear",
                    paddingBottom: "1rem",
                  }}
                >
                  <img
                    loading="lazy"
                    width="230px"
                    src="https://picsum.photos/id/1"
                    srcSet={d.imgSrc}
                    style={{
                      borderRadius: "13px",
                      minHeight: `${(d.imgWidth / d.imgHeigh) * 230}px`,
                      breakInside: "avoid",
                    }}
                  />
                  <span style={{ color: "white" }}>{d.name}</span>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#202020",
        }}
      >
        <InfiniteScroll />
      </div>
    </QueryClientProvider>
  );
}

export default App;
