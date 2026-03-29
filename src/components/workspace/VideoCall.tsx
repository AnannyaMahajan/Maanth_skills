import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, Maximize2, Users, MessageSquare, MonitorUp, MonitorOff, Sparkles, Circle, Square } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VideoCallProps {
  onEndCall: () => void;
}

export default function VideoCall({ onEndCall }: VideoCallProps) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);
  const [isBlurred, setIsBlurred] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = React.useState<string>('');
  const [selectedAudioId, setSelectedAudioId] = React.useState<string>('');
  const [micLevel, setMicLevel] = React.useState(0);
  
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recordedChunksRef = React.useRef<Blob[]>([]);

  const startRecording = () => {
    if (!stream) return;
    
    recordedChunksRef.current = [];
    const mimeType = 'video/webm;codecs=vp9,opus';
    const options = MediaRecorder.isTypeSupported(mimeType) 
      ? { mimeType } 
      : { mimeType: 'video/webm' };

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `maanth-session-${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const setupAudioAnalysis = (audioStream: MediaStream) => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);
    analyser.fftSize = 256;
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setMicLevel(average / 128); // Normalize roughly to 0-1
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const startVideo = async (videoId?: string, audioId?: string) => {
    try {
      stopStream();
      const constraints = {
        video: videoId ? { deviceId: { exact: videoId } } : true,
        audio: audioId ? { deviceId: { exact: audioId } } : true
      };
      const userStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = userStream;
      setStream(userStream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userStream;
      }

      // Setup audio analysis for mic level
      setupAudioAnalysis(userStream);

      // Apply current mute/video states to new stream
      userStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      userStream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);

    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  React.useEffect(() => {
    const init = async () => {
      await startVideo();
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);
      
      const videoDevice = allDevices.find(d => d.kind === 'videoinput');
      const audioDevice = allDevices.find(d => d.kind === 'audioinput');
      if (videoDevice) setSelectedVideoId(videoDevice.deviceId);
      if (audioDevice) setSelectedAudioId(audioDevice.deviceId);
    };

    init();

    return () => stopStream();
  }, []);

  const toggleMute = () => {
    if (stream) {
      const newState = !isMuted;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !newState;
      });
      setIsMuted(newState);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const newState = !isVideoOff;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !newState;
      });
      setIsVideoOff(newState);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      await startVideo(selectedVideoId, selectedAudioId);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        
        // Stop current video tracks but keep audio if possible
        if (streamRef.current) {
          streamRef.current.getVideoTracks().forEach(track => track.stop());
        }

        setStream(screenStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          startVideo(selectedVideoId, selectedAudioId);
        };
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleDeviceChange = async (type: 'video' | 'audio', deviceId: string) => {
    if (type === 'video') {
      setSelectedVideoId(deviceId);
      await startVideo(deviceId, selectedAudioId);
    } else {
      setSelectedAudioId(deviceId);
      await startVideo(selectedVideoId, deviceId);
    }
  };

  return (
    <div ref={containerRef} className="relative h-full bg-[#002A24] overflow-hidden flex flex-col">
      {/* Remote Video (Simulated) */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto animate-pulse">
              <Users size={40} className="text-white/40" />
            </div>
            <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Waiting for Elena Rossi...</p>
          </div>
        </div>

        {/* Local Video Overlay */}
        <motion.div 
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          className="absolute bottom-6 right-6 w-48 aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 z-10 cursor-move"
        >
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
              <VideoOff size={24} className="text-white/40" />
            </div>
          ) : (
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className={cn(
                "w-full h-full object-cover mirror transition-all duration-500",
                isBlurred && "blur-xl scale-110"
              )}
            />
          )}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-0.5 bg-black/40 rounded-full">
            <p className="text-[10px] text-white font-bold uppercase tracking-widest">You</p>
            {/* Mic Level Indicator */}
            {!isMuted && (
              <div className="flex gap-0.5 items-end h-2">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className="w-0.5 bg-[#FDD828] rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(20, micLevel * 100 * (i/3))}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white font-bold">00:12:45</span>
            </div>
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-3 py-2 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-full flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Recording</span>
              </motion.div>
            )}
          </div>
          <div className="flex gap-2 relative">
            <button 
              onClick={toggleFullscreen}
              className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all"
            >
              <Maximize2 size={18} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 backdrop-blur-md text-white rounded-full transition-all",
                showSettings ? "bg-primary" : "bg-black/40 hover:bg-black/60"
              )}
            >
              <Settings size={18} />
            </button>

            {/* Settings Dropdown */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl p-4 z-50 space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Camera</label>
                    <select 
                      value={selectedVideoId}
                      onChange={(e) => handleDeviceChange('video', e.target.value)}
                      className="w-full p-2 bg-surface-container-low rounded-xl text-xs font-bold text-primary border-none focus:ring-2 focus:ring-primary"
                    >
                      {devices.filter(d => d.kind === 'videoinput').map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Microphone</label>
                    <select 
                      value={selectedAudioId}
                      onChange={(e) => handleDeviceChange('audio', e.target.value)}
                      className="w-full p-2 bg-surface-container-low rounded-xl text-xs font-bold text-primary border-none focus:ring-2 focus:ring-primary"
                    >
                      {devices.filter(d => d.kind === 'audioinput').map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-2 border-t border-surface-container-high">
                    <button 
                      onClick={() => setIsBlurred(!isBlurred)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl transition-all",
                        isBlurred ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low text-on-surface-variant"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} />
                        <span className="text-xs font-bold">Blur Background</span>
                      </div>
                      <div className={cn(
                        "w-8 h-4 rounded-full relative transition-all",
                        isBlurred ? "bg-primary" : "bg-surface-container-high"
                      )}>
                        <div className={cn(
                          "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                          isBlurred ? "right-0.5" : "left-0.5"
                        )} />
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-8 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button 
            onClick={toggleMute}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
            )}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button 
            onClick={toggleVideo}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
            )}
            title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white hover:bg-white/20"
            )}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Circle size={20} fill="currentColor" />}
          </button>

          <button 
            onClick={onEndCall}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl hover:bg-red-700"
            title="End Call"
          >
            <PhoneOff size={24} />
          </button>

          <button 
            onClick={toggleScreenShare}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              isScreenSharing ? "bg-primary text-white" : "bg-white/10 text-white hover:bg-white/20"
            )}
            title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          >
            {isScreenSharing ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
          </button>

          <button 
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-lg"
            title="Chat"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
