import { useLayoutEffect, useRef } from "react";
import DragButtonInst from "./inst";
import styles from "./button.module.less";

interface PanelProps {
  onClick?: () => void;
  children: React.ReactNode;
}

function DragButton({ onClick, children }: PanelProps) {
  const panelRef = useRef<DragButtonInst>();
  const overlayRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !overlayRef.current) {
      return;
    }

    panelRef.current = new DragButtonInst({
      wrapper: wrapperRef.current,
      overlay: overlayRef.current,
      initialY: 200,
    });

    // @ts-ignore
    window.panel = panelRef.current;

    return () => {
      panelRef.current?.destroy();
    }
  }, []);

  const onClickWrapper = () => {
    if (panelRef.current && !panelRef.current.isMoved) {
      onClick?.();
    }
  }

  return (
    <div>
      <div ref={overlayRef} className={styles.overlay}></div>
      <div ref={wrapperRef} className={styles.panel} onClick={onClickWrapper}>
        {children}
      </div>
    </div>
  )
}

export default DragButton;
