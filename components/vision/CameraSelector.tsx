'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { listVideoInputDevices, openCameraStream, type CameraDevice } from '@/lib/vision/engineClient';
import { trackVisionEvent, VISION_OBSERVABILITY_EVENTS } from '@/lib/vision/events';
import { captureError } from '@/lib/monitoring';

type CameraSlot = 1 | 2;

type Props = {
  onChange?: (state: { camera1?: CameraDevice; camera2?: CameraDevice }) => void;
};

export function CameraSelector({ onChange }: Props) {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [camera1Id, setCamera1Id] = useState<string>('');
  const [camera2Id, setCamera2Id] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);
  const stream1Ref = useRef<MediaStream | null>(null);
  const stream2Ref = useRef<MediaStream | null>(null);

  async function searchCameras() {
    setLoading(true);
    setError(null);
    try {
      const found = await listVideoInputDevices();
      setDevices(found);
      if (!found.length) {
        setError('No se detectaron cámaras. Verifica los permisos del navegador.');
      }
    } catch (err) {
      captureError(err, { area: 'vision', action: 'searchCameras' });
      setError('No se pudo acceder a las cámaras.');
      trackVisionEvent(VISION_OBSERVABILITY_EVENTS.cameraConnectionFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    searchCameras();
    return () => {
      stream1Ref.current?.getTracks().forEach((t) => t.stop());
      stream2Ref.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connectSlot(slot: CameraSlot, deviceId: string) {
    const stream = await openCameraStream(deviceId);
    if (!stream) {
      setError(`No se pudo conectar la cámara ${slot}.`);
      trackVisionEvent(VISION_OBSERVABILITY_EVENTS.cameraConnectionFailed, { slot });
      return;
    }
    if (slot === 1) {
      stream1Ref.current?.getTracks().forEach((t) => t.stop());
      stream1Ref.current = stream;
      if (video1Ref.current) video1Ref.current.srcObject = stream;
      setCamera1Id(deviceId);
    } else {
      stream2Ref.current?.getTracks().forEach((t) => t.stop());
      stream2Ref.current = stream;
      if (video2Ref.current) video2Ref.current.srcObject = stream;
      setCamera2Id(deviceId);
    }

    const cam1 = devices.find((d) => d.deviceId === (slot === 1 ? deviceId : camera1Id));
    const cam2 = devices.find((d) => d.deviceId === (slot === 2 ? deviceId : camera2Id));
    onChange?.({ camera1: cam1, camera2: cam2 });

    if ((slot === 1 && camera2Id) || (slot === 2 && camera1Id)) {
      trackVisionEvent(VISION_OBSERVABILITY_EVENTS.camerasConnected);
    }
  }

  return (
    <section className="card vision-camera-selector">
      <div className="row">
        <h3 className="card-title">Cámaras</h3>
        <button type="button" className="btn btn-soft" onClick={searchCameras} disabled={loading}>
          <RefreshCw size={16} /> {loading ? 'Buscando…' : 'Buscar cámaras'}
        </button>
      </div>

      {error && <p className="p vision-error">{error}</p>}

      <div className="grid-2">
        <div className="vision-camera-slot">
          <label className="muted">Cámara 1</label>
          <select
            className="vision-select"
            value={camera1Id}
            onChange={(e) => connectSlot(1, e.target.value)}
          >
            <option value="">Selecciona una cámara</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
          <video ref={video1Ref} autoPlay muted playsInline className="vision-preview" />
        </div>

        <div className="vision-camera-slot">
          <label className="muted">Cámara 2</label>
          <select
            className="vision-select"
            value={camera2Id}
            onChange={(e) => connectSlot(2, e.target.value)}
          >
            <option value="">Selecciona una cámara</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
          <video ref={video2Ref} autoPlay muted playsInline className="vision-preview" />
        </div>
      </div>
    </section>
  );
}
