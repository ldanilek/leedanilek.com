import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const ReadingList = () => {
  const readingList = useQuery(api.readingList.get);
  const swapOrder = useMutation(api.readingList.swapOrder);

  if (!readingList) return null;

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftSide = clickX < rect.width / 3;
    const isRightSide = clickX > (rect.width * 2) / 3;

    if (!isLeftSide && !isRightSide) return;
    if (isLeftSide && index === 0) return;
    if (isRightSide && index === readingList.length - 1) return;

    const currentItem = readingList[index];
    const otherIndex = isLeftSide ? index - 1 : index + 1;
    const otherItem = readingList[otherIndex];

    await swapOrder({ 
      firstItemId: currentItem._id, 
      secondItemId: otherItem._id 
    });
  };

  return (
    <section id="reading">
      <h3>Reading List</h3>
      <p>Media I recommend:</p>
      <div className="reading-list">
        {readingList.map((item, index) => (
          <div
            key={item._id}
            className={`reading-list-item ${item.type}`}
            onClick={(e) => handleClick(e, index)}
          >
            {item.title}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReadingList; 