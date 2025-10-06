import { useEffect, useRef, useState } from "react";

interface ViewTrackerProps {
  children: React.ReactNode;
  postId: string;
  onView: (postId: string) => void;
  viewed: boolean;
  isLast: boolean;
  onLastInView: () => void;
}

const ViewTracker: React.FC<ViewTrackerProps> = ({
  children,
  postId,
  onView,
  viewed,
  isLast,
  onLastInView,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasViewed, setHasViewed] = useState(viewed);
  const [lastFired, setLastFired] = useState(false);

  useEffect(() => {
    if (hasViewed && (!isLast || lastFired)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasViewed) {
            onView(postId);
            setHasViewed(true);
          }
          if (isLast && !lastFired) {
            onLastInView();
            setLastFired(true);
          }
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [hasViewed, postId, isLast, lastFired]);

  return <div ref={ref}>{children}</div>;
};
export default ViewTracker;
