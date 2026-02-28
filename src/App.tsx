/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  ChevronDown, 
  ChevronUp,
  History,
  ExternalLink,
  Settings2,
  Palette,
  Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface QRHistoryItem {
  id: string;
  url: string;
  timestamp: number;
}

// --- Components ---

const AdPlaceholder = ({ className, label = "Anuncio AdSense" }: { className?: string; label?: string }) => (
  <div className={cn("ad-placeholder rounded-lg overflow-hidden", className)}>
    {/* 
      PARA MONETIZACIÓN: Reemplazar este div con el código de Google AdSense 
      Ejemplo:
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="XXXXXXXXXX"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    */}
    <span>{label}</span>
  </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-800">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {question}
        </span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  // --- State ---
  const [url, setUrl] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [downloadName, setDownloadName] = useState('mi-codigo-qr');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Logic ---

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('qr_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing history", e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = useCallback((newUrl: string) => {
    if (!newUrl) return;
    setHistory(prev => {
      const filtered = prev.filter(item => item.url !== newUrl);
      const updated = [{ id: Date.now().toString(), url: newUrl, timestamp: Date.now() }, ...filtered].slice(0, 5);
      localStorage.setItem('qr_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const generateQR = useCallback(async (text: string) => {
    if (!text) return;
    
    let finalUrl = text.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    setIsGenerating(true);
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, finalUrl, {
          width: size,
          margin: 2,
          color: {
            dark: qrColor,
            light: bgColor,
          },
          errorCorrectionLevel: 'H'
        });
        saveToHistory(finalUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [size, qrColor, bgColor, saveToHistory]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url) generateQR(url);
    }, 500);
    return () => clearTimeout(timer);
  }, [url, generateQR]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${downloadName || 'qr-code'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const handleClear = () => {
    setUrl('');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Pro - Generador de Códigos QR',
          text: 'Crea tus códigos QR gratis con esta herramienta profesional.',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const isHttps = url.toLowerCase().startsWith('https://') || (!url.toLowerCase().startsWith('http://') && url.length > 0);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* SEO & Meta Tags (Simulated for this React environment) */}
      <header className="sr-only">
        <h1>Generador de Códigos QR Gratis Online - QR Pro</h1>
        <p>Crea códigos QR profesionales de forma rápida y sencilla. Personaliza el color, tamaño y descarga en formato PNG de alta calidad.</p>
      </header>

      {/* Top Banner Ad */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4">
        <AdPlaceholder className="h-24 w-full" label="Banner Superior (728x90)" />
      </div>

      {/* Navigation / Logo */}
      <nav className="w-full max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
            QR<span className="text-indigo-600">Pro</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all"
            title="Compartir herramienta"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
        
        {/* Left Column: Generator & Content */}
        <div className="lg:col-span-9 space-y-8">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Side: Inputs */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Configura tu QR</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ingresa el enlace y personaliza el diseño en tiempo real.</p>
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <label htmlFor="qr-url" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Enlace o Texto
                    {url && (
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold uppercase tracking-wider",
                        isHttps ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {isHttps ? <ShieldCheck className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                        {isHttps ? "Seguro" : "Inseguro"}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id="qr-url"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://tu-sitio-web.com"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all text-lg outline-none"
                    />
                    {url && (
                      <button 
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Customization Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Size Selection */}
                  <div className="space-y-2 col-span-full">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Maximize className="w-4 h-4" /> Tamaño
                    </label>
                    <div className="flex gap-2">
                      {[
                        { label: 'S', val: 200 },
                        { label: 'M', val: 300 },
                        { label: 'L', val: 500 }
                      ].map((s) => (
                        <button
                          key={s.val}
                          onClick={() => setSize(s.val)}
                          className={cn(
                            "flex-1 py-2 rounded-xl border-2 transition-all font-medium",
                            size === s.val 
                              ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30" 
                              : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR Color */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Color QR
                    </label>
                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700">
                      <input 
                        type="color" 
                        value={qrColor} 
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-xs font-mono uppercase text-slate-500">{qrColor}</span>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Fondo
                    </label>
                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700">
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-xs font-mono uppercase text-slate-500">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Preview & Download */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-700 space-y-6 flex flex-col items-center justify-between min-h-[450px]">
                <div className="w-full space-y-4 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resultado</span>
                    {url && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Listo
                      </span>
                    )}
                  </div>
                  
                  <div className="qr-container flex justify-center items-center w-full bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 aspect-square max-w-[280px]">
                    {url ? (
                      <canvas ref={canvasRef} className="w-full h-full" />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center gap-3 py-12">
                        <QrCode className="w-20 h-20 opacity-10" />
                        <p className="text-xs font-medium text-slate-400">Generando vista previa...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del archivo</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={downloadName}
                        onChange={(e) => setDownloadName(e.target.value)}
                        placeholder="nombre-del-archivo"
                        disabled={!url}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <button
                      onClick={handleDownload}
                      disabled={!url || isGenerating}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl",
                        url && !isGenerating
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                      )}
                    >
                      <Download className={cn("w-6 h-6", url ? "animate-bounce-subtle" : "")} /> 
                      Descargar QR (.PNG)
                    </button>
                    
                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-2 px-4 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ¡Imagen guardada con éxito!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <p className="text-[10px] text-center text-slate-400 px-4 leading-tight">
                    El archivo se descargará en alta resolución (PNG) listo para imprimir o compartir.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Descriptive Content (SEO) */}
          <section className="space-y-12 py-8">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">¿Qué es un código QR y para qué sirve?</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Un código QR (Quick Response code) es un código de barras bidimensional que puede ser escaneado por smartphones y otros dispositivos con cámara. A diferencia de los códigos de barras tradicionales, los QR pueden almacenar mucha más información, como enlaces web, datos de contacto, redes WiFi y más.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Usos comunes
                  </h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li>• Menús digitales en restaurantes.</li>
                    <li>• Enlaces a sitios web y redes sociales.</li>
                    <li>• Pagos móviles rápidos y seguros.</li>
                    <li>• Tarjetas de visita digitales (vCard).</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-indigo-600" /> Cómo usar QR Pro
                  </h3>
                  <ol className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li>1. Pega tu enlace en el campo superior.</li>
                    <li>2. Personaliza el color y tamaño a tu gusto.</li>
                    <li>3. El QR se generará automáticamente.</li>
                    <li>4. Haz clic en "Descargar" para obtener tu imagen.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Preguntas Frecuentes (FAQ)</h2>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <FAQItem 
                  question="¿Es gratis generar códigos QR con esta herramienta?" 
                  answer="Sí, QR Pro es una herramienta 100% gratuita y siempre lo será. No necesitas registrarte ni pagar ninguna suscripción para crear y descargar tus códigos."
                />
                <FAQItem 
                  question="¿Los códigos QR caducan?" 
                  answer="No, los códigos QR generados aquí son estáticos, lo que significa que la información está codificada directamente en la imagen. Mientras el enlace de destino funcione, el código QR funcionará para siempre."
                />
                <FAQItem 
                  question="¿Puedo usar los códigos QR para fines comerciales?" 
                  answer="¡Por supuesto! Puedes usar los códigos generados en tarjetas de visita, carteles, menús, productos o cualquier material de marketing sin restricciones."
                />
                <FAQItem 
                  question="¿Qué formato de archivo obtengo al descargar?" 
                  answer="Actualmente permitimos la descarga en formato PNG de alta calidad, que es ideal para la mayoría de usos digitales e impresos."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Ads & History */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="sticky top-8 space-y-8">
            {/* Sidebar Ad */}
            <AdPlaceholder className="h-[400px] w-full" label="Anuncio Lateral" />

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" /> Recientes
                </h3>
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setUrl(item.url)}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                          {item.url}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <AdPlaceholder className="h-[250px] w-full" label="Anuncio Inferior" />
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-12 py-12">
        <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                QR<span className="text-indigo-600">Pro</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs">
              La herramienta definitiva para crear códigos QR profesionales de forma gratuita, rápida y segura.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Términos de Uso</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Cookies</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Contacto</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="mailto:soporte@qrpro.com" className="hover:text-indigo-600 transition-colors">Soporte</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Publicidad</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Sugerencias</a></li>
            </ul>
          </div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-xs">
          <p>© {new Date().getFullYear()} QR Pro. Todos los derechos reservados. Hecho con ❤️ para la web.</p>
        </div>
      </footer>
    </div>
  );
}
