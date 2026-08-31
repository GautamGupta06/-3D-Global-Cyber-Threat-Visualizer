import { useState, useEffect, useRef } from 'react';

export default function PlaybackControlBar({
  isPlaybackMode,
  onTogglePlaybackMode,
  playbackEvents = [],
  currentIndex = 0,
  isPlaying = false,
  onPlay,
  onPause,
  onSeek,
  onStepForward,
  onStepBackward,
  playbackSpeed = 1,
  onChangeSpeed,
  selectedWindow = '1h',
  onSelectWindow,
  loading = false
}) {
  const currentEvent = playbackEvents[currentIndex] || null;

  const formatTimestamp = (ts) => {
    if (!ts) return '--:--:--';
    const d = new Date(typeof ts === 'number' && ts < 10000000000 ? ts * 1000 : ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const startTimestamp = playbackEvents[0]?.timestamp;
  const endTimestamp = playbackEvents[playbackEvents.length - 1]?.timestamp;

  return (
    <div style={{
      position: 'absolute',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 60,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.95) 0%, rgba(1, 15, 30, 0.96) 100%)',
      border: isPlaybackMode ? '1px solid #ffd166' : '1px solid rgba(0, 255, 204, 0.35)',
      borderRadius: '12px',
      padding: '10px 18px',
      backdropFilter: 'blur(16px)',
      boxShadow: isPlaybackMode ? '0 0 30px rgba(255, 209, 102, 0.25)' : '0 0 25px rgba(0, 255, 204, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '540px',
      maxWidth: '92vw',
      pointerEvents: 'auto',
      transition: 'all 0.3s ease'
    }}>
      {/* ─── Top Row: Mode Switcher & Time Presets ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <button
          onClick={onTogglePlaybackMode}
          style={{
            fontFamily: 'inherit',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            padding: '5px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            border: `1px solid ${isPlaybackMode ? '#ffd166' : '#00ffcc'}`,
            background: isPlaybackMode ? 'rgba(255, 209, 102, 0.2)' : 'rgba(0, 255, 204, 0.12)',
            color: isPlaybackMode ? '#ffd166' : '#00ffcc',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <span>{isPlaybackMode ? '⏪ HISTORICAL PLAYBACK' : '🔴 LIVE STREAM'}</span>
        </button>

        {isPlaybackMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', marginRight: '4px' }}>RANGE:</span>
            {['15m', '1h', '6h', '24h'].map(w => (
              <button
                key={w}
                onClick={() => onSelectWindow(w)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  fontWeight: selectedWindow === w ? 'bold' : 'normal',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: `1px solid ${selectedWindow === w ? '#ffd166' : 'rgba(255,255,255,0.12)'}`,
                  background: selectedWindow === w ? 'rgba(255, 209, 102, 0.2)' : 'rgba(255,255,255,0.04)',
                  color: selectedWindow === w ? '#ffd166' : 'rgba(255,255,255,0.65)',
                }}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {isPlaybackMode && (
          <div style={{ fontSize: '10px', color: '#ffd166', fontWeight: 'bold' }}>
            {loading ? '⏳ Loading store...' : `${currentIndex + 1} / ${playbackEvents.length} events`}
          </div>
        )}
      </div>

      {/* ─── Playback Scrubber & Transport Controls (When Playback Active) ─── */}
      {isPlaybackMode && (
        <>
          {/* Scrubber slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', minWidth: '55px' }}>
              {formatTimestamp(startTimestamp)}
            </span>

            <input
              type="range"
              min={0}
              max={Math.max(0, playbackEvents.length - 1)}
              value={currentIndex}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={playbackEvents.length === 0}
              style={{
                flex: 1,
                cursor: 'pointer',
                accentColor: '#ffd166'
              }}
            />

            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', minWidth: '55px', textAlign: 'right' }}>
              {formatTimestamp(endTimestamp)}
            </span>
          </div>

          {/* Transport buttons & speed */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={onStepBackward}
                disabled={currentIndex <= 0}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  borderRadius: '5px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: currentIndex > 0 ? 'pointer' : 'not-allowed',
                  opacity: currentIndex > 0 ? 1 : 0.4
                }}
                title="Step 1 Event Backward"
              >
                ⏮
              </button>

              <button
                onClick={isPlaying ? onPause : onPlay}
                disabled={playbackEvents.length === 0}
                style={{
                  background: isPlaying ? 'rgba(255, 209, 102, 0.25)' : 'rgba(0, 255, 204, 0.2)',
                  border: `1px solid ${isPlaying ? '#ffd166' : '#00ffcc'}`,
                  color: isPlaying ? '#ffd166' : '#00ffcc',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>

              <button
                onClick={onStepForward}
                disabled={currentIndex >= playbackEvents.length - 1}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  borderRadius: '5px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: currentIndex < playbackEvents.length - 1 ? 'pointer' : 'not-allowed',
                  opacity: currentIndex < playbackEvents.length - 1 ? 1 : 0.4
                }}
                title="Step 1 Event Forward"
              >
                ⏭
              </button>
            </div>

            {/* Current Event Timestamp Info */}
            <div style={{ fontSize: '11px', color: '#ffffff' }}>
              <span>Scrub Time: </span>
              <strong style={{ color: '#ffd166' }}>{formatTimestamp(currentEvent?.timestamp)}</strong>
              {currentEvent && (
                <span style={{ marginLeft: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
                  ({currentEvent.attack_type} &middot; {currentEvent.city?.split(',')[0] || currentEvent.source_ip})
                </span>
              )}
            </div>

            {/* Speed Multiplier */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', marginRight: '2px' }}>SPEED:</span>
              {[0.5, 1, 2, 5].map(spd => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '9px',
                    fontWeight: playbackSpeed === spd ? 'bold' : 'normal',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    border: `1px solid ${playbackSpeed === spd ? '#ffd166' : 'rgba(255,255,255,0.1)'}`,
                    background: playbackSpeed === spd ? 'rgba(255, 209, 102, 0.25)' : 'rgba(255,255,255,0.04)',
                    color: playbackSpeed === spd ? '#ffd166' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
