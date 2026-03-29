import React from 'react';
import { Stage, Layer, Line, Rect, Circle } from 'react-konva';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Square, Circle as CircleIcon, Eraser, Trash2, Download, Settings2, Maximize, Scaling } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WhiteboardProps {
  socket: WebSocket | null;
  roomId: string;
}

interface DrawingElement {
  tool: string;
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeWidth: number;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '16:9', value: 16/9 },
  { label: 'A4', value: 1/1.414 },
];

export default function Whiteboard({ socket, roomId }: WhiteboardProps) {
  const [tool, setTool] = React.useState('pen');
  const [elements, setElements] = React.useState<DrawingElement[]>([]);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });
  const [isAutoResize, setIsAutoResize] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<string | number>('free');
  
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Responsive sizing
  React.useEffect(() => {
    if (!containerRef.current || !isAutoResize) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isAutoResize]);

  React.useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'whiteboard_update' && data.roomId === roomId) {
          setElements(data.elements);
        }
      } catch (e) {
        console.error('Error parsing whiteboard message:', e);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, roomId]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    let newElement: DrawingElement;
    if (tool === 'pen' || tool === 'eraser') {
      newElement = {
        tool,
        points: [pos.x, pos.y],
        color: tool === 'eraser' ? '#ffffff' : '#002A24',
        strokeWidth: tool === 'eraser' ? 20 : 2,
      };
    } else if (tool === 'rect') {
      newElement = {
        tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: '#002A24',
        strokeWidth: 2,
      };
    } else { // circle
      newElement = {
        tool,
        x: pos.x,
        y: pos.y,
        radius: 0,
        color: '#002A24',
        strokeWidth: 2,
      };
    }
    
    setElements(prev => [...prev, newElement]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    setElements(prev => {
      const newElements = [...prev];
      const lastElement = { ...newElements[newElements.length - 1] };

      if (tool === 'pen' || tool === 'eraser') {
        lastElement.points = [...(lastElement.points || []), point.x, point.y];
      } else if (tool === 'rect') {
        lastElement.width = point.x - (lastElement.x || 0);
        lastElement.height = point.y - (lastElement.y || 0);
      } else if (tool === 'circle') {
        const dx = point.x - (lastElement.x || 0);
        const dy = point.y - (lastElement.y || 0);
        lastElement.radius = Math.sqrt(dx * dx + dy * dy);
      }

      newElements[newElements.length - 1] = lastElement;
      return newElements;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    broadcastUpdate(elements);
  };

  const broadcastUpdate = (newElements: DrawingElement[]) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'whiteboard_update',
        roomId,
        elements: newElements
      }));
    }
  };

  const clearBoard = () => {
    setElements([]);
    broadcastUpdate([]);
  };

  const downloadImage = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDimensionChange = (width: number, height: number) => {
    setDimensions({ width, height });
    setIsAutoResize(false);
  };

  const handleAspectRatioChange = (ratio: string | number) => {
    setAspectRatio(ratio);
    if (ratio === 'free') {
      setIsAutoResize(true);
    } else {
      const currentWidth = dimensions.width;
      const newHeight = currentWidth / (ratio as number);
      setDimensions({ width: currentWidth, height: newHeight });
      setIsAutoResize(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { id: 'pen', icon: Pencil, label: 'Pencil' },
            { id: 'rect', icon: Square, label: 'Rectangle' },
            { id: 'circle', icon: CircleIcon, label: 'Circle' },
            { id: 'eraser', icon: Eraser, label: 'Eraser' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={cn(
                "p-2 rounded-xl transition-all",
                tool === t.id ? "bg-primary text-white shadow-md" : "hover:bg-surface-container text-on-surface-variant"
              )}
              title={t.label}
            >
              <t.icon size={18} />
            </button>
          ))}
          <div className="w-px h-6 bg-surface-container-high mx-2" />
          <button
            onClick={clearBoard}
            className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-all"
            title="Clear Board"
          >
            <Trash2 size={18} />
          </button>
          <div className="w-px h-6 bg-surface-container-high mx-2" />
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 rounded-xl transition-all",
                showSettings ? "bg-primary text-white shadow-md" : "hover:bg-surface-container text-on-surface-variant"
              )}
              title="Canvas Settings"
            >
              <Settings2 size={18} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl p-4 z-50 space-y-4 border border-surface-container-high"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <Maximize size={12} />
                      Dimensions
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] text-on-surface-variant uppercase font-bold">Width</span>
                        <input
                          type="number"
                          value={Math.round(dimensions.width)}
                          onChange={(e) => handleDimensionChange(parseInt(e.target.value) || 0, dimensions.height)}
                          className="w-full p-2 bg-surface-container-low rounded-xl text-xs font-bold text-primary border-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-on-surface-variant uppercase font-bold">Height</span>
                        <input
                          type="number"
                          value={Math.round(dimensions.height)}
                          onChange={(e) => handleDimensionChange(dimensions.width, parseInt(e.target.value) || 0)}
                          className="w-full p-2 bg-surface-container-low rounded-xl text-xs font-bold text-primary border-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <Scaling size={12} />
                      Aspect Ratio
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {ASPECT_RATIOS.map((ratio) => (
                        <button
                          key={ratio.label}
                          onClick={() => handleAspectRatioChange(ratio.value)}
                          className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold transition-all",
                            aspectRatio === ratio.value 
                              ? "bg-primary text-white" 
                              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                          )}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAutoResize(true);
                      setAspectRatio('free');
                      setShowSettings(false);
                    }}
                    className="w-full py-2 bg-surface-container text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-surface-container-high transition-all"
                  >
                    Reset to Responsive
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <button
          onClick={downloadImage}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container text-primary text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-surface-container-high transition-all shadow-sm"
        >
          <Download size={14} />
          Export PNG
        </button>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        className="flex-1 bg-[#F9F7F4] relative cursor-crosshair overflow-auto scrollbar-hide"
      >
        <div 
          className="relative bg-white shadow-lg mx-auto"
          style={{ 
            width: dimensions.width, 
            height: dimensions.height,
            minWidth: dimensions.width,
            minHeight: dimensions.height
          }}
        >
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onMouseLeave={handleMouseUp}
            ref={stageRef}
          >
            <Layer>
              {elements.map((el, i) => {
                if (el.tool === 'pen' || el.tool === 'eraser') {
                  return (
                    <Line
                      key={i}
                      points={el.points}
                      stroke={el.color}
                      strokeWidth={el.strokeWidth}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={
                        el.tool === 'eraser' ? 'destination-out' : 'source-over'
                      }
                    />
                  );
                } else if (el.tool === 'rect') {
                  return (
                    <Rect
                      key={i}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      stroke={el.color}
                      strokeWidth={el.strokeWidth}
                    />
                  );
                } else if (el.tool === 'circle') {
                  return (
                    <Circle
                      key={i}
                      x={el.x}
                      y={el.y}
                      radius={el.radius}
                      stroke={el.color}
                      strokeWidth={el.strokeWidth}
                    />
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
