import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import FlipMove from "react-flip-move";
import { Doc } from "../../convex/_generated/dataModel";
import './ReadingList.css';

const ReadingListItem = ({ item }: { item: Doc<"readingList"> }) => {
  return (
    <div 
      className={`reading-list-item ${item.type}`}
      title="Click to reorder"
    >
      <div className="reading-list-item-left-gradient" />
      <div className="reading-list-item-right-gradient" />
      {item.type === 'book' && <div className="reading-list-item-icon">📚</div>}
      {item.type === 'video' && <div className="reading-list-item-icon">🎥</div>}
      {item.title}
    </div>
  );
};

const ReadingList = () => {
  const readingList = useQuery(api.readingList.get);
  const swapOrder = useMutation(api.readingList.swapOrder);

  if (!readingList) return null;

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftSide = clickX < rect.width / 2;
    const isRightSide = clickX > rect.width / 2;

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
      <FlipMove typeName={null} className="reading-list">
        {readingList.map((item, index) => (
          <div key={item._id} className="reading-list-container" onClick={(e) => handleClick(e, index)}>
            <ReadingListItem
              item={item}
            />
          </div>
        ))}
      </FlipMove>
    </section>
  );
};

export default ReadingList; 