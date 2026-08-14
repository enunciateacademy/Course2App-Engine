import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Terminal,
  HelpCircle,
  FileCode,
  Share2
} from 'lucide-react';
import { AppConfig } from '../types';
import { downloadDirectTestApk } from '../utils/androidGenerator';

interface PhoneTestModalProps {
  app: AppConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneTestModal: React.FC<PhoneTestModalProps> = ({
  app,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'apk' | 'qr' | 'cloud' | 'instructions'>('apk');
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen || !app) return null;

  // Build the live test runner URL
  const testUrl = `${window.location.origin}${window.location.pathname}?testAppId=${encodeURIComponent(app.id)}#mobile-runner`;

  useEffect(() => {
    // Generate high-resolution QR code
    QRCode.toDataURL(
      testUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [testUrl, app.id]);

  const handleDownloadApk = async () => {
    setIsDownloadingApk(true);
    try {
      await downloadDirectTestApk(app);
    } catch (err) {
      console.error('Failed to generate APK:', err);
    } finally {
      setIsDownloadingApk(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(testUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div
          className="p-6 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${app.primaryColor || '#1e3a8a'} 0%, #0f172a 100%)`
          }}
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-1 text-2xl font-bold text-white shadow-inner backdrop-blur-xs overflow-hidden border border-white/20"
              >
                {app.launcherIconUrl || app.logoUrl ? (
                  <img
                    src={app.launcherIconUrl || app.logoUrl}
                    alt={app.appName}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  app.instituteName.charAt(0)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                    Instant Android Testing
                  </span>
                  <span className="font-mono text-xs text-white/70">v{app.versionName || '1.0.0'}</span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight mt-1">{app.appName}</h2>
                <p className="text-xs text-white/80 font-medium">{app.instituteName} • {app.packageId}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/75 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'apk'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="h-4 w-4 text-blue-600" />
            1. Direct .APK Download
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'qr'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="h-4 w-4 text-emerald-600" />
            2. Scan QR & Mobile Test
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instructions')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'instructions'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="h-4 w-4 text-purple-600" />
            3. Android Install Guide
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'cloud'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="h-4 w-4 text-slate-700" />
            4. Cloud AAB/APK Build
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: DIRECT APK DOWNLOAD */}
          {activeTab === 'apk' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50/60 p-5 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                    Instant Test Binary
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {app.packageId.replace(/[^a-z0-9]/g, '_')}_v{app.versionName || '1.0.0'}_test.apk
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                    Download and test this package directly on your Android phone. Contains native Capacitor Android Bridge, AndroidManifest, adaptive drawables, and live WebView engine.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadApk}
                  disabled={isDownloadingApk}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all shrink-0 w-full md:w-auto"
                >
                  <Download className="h-4 w-4" />
                  {isDownloadingApk ? 'Generating .APK File...' : 'Download .APK File'}
                </button>
              </div>

              {/* Step-by-Step Quick Sideload instructions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-600" />
                  How to Install the .APK on Android in 3 Steps:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                      1
                    </div>
                    <h5 className="font-bold text-slate-900">Download or Transfer</h5>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Download the .apk directly on your Android phone, or download here and send via WhatsApp/Drive.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                      2
                    </div>
                    <h5 className="font-bold text-slate-900">Allow from Source</h5>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Tap the .apk file. When prompted by Android, tap <strong>Settings</strong> $\rightarrow$ toggle ON <strong>Allow from this source</strong>.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                      3
                    </div>
                    <h5 className="font-bold text-slate-900">Install & Launch</h5>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Tap <strong>Install</strong>. Once complete, tap <strong>Open</strong> to test your branded splash screen, navigation, and course content!
                    </p>
                  </div>
                </div>
              </div>

              {/* Pro-Tip Box */}
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Google Play Protect Notice for Debug/Test APKs:</span>
                  <span className="text-[11px] text-amber-800 leading-relaxed">
                    Because this test APK is generated for private staging/sideloading and not yet distributed through Google Play's cloud keys, Google Play Protect may show a standard <em>"Unrecognized Developer"</em> or <em>"Install anyway"</em> prompt. Tap <strong>"More details" $\rightarrow$ "Install anyway"</strong> to proceed.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCAN QR & MOBILE TEST */}
          {activeTab === 'qr' && (
            <div className="flex flex-col md:flex-row items-center gap-8 py-2">
              <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
                {qrDataUrl ? (
                  <div className="rounded-2xl bg-white p-3 shadow-inner">
                    <img src={qrDataUrl} alt="App QR Code" className="h-48 w-48 rounded-lg" />
                  </div>
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-xs text-slate-400">
                    Generating QR Code...
                  </div>
                )}
                <span className="mt-3 text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                  Scan with any Android phone camera
                </span>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Instant Full-Screen Mobile Testing
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Test your custom splash screen, color theme ({app.primaryColor}), navigation header, and course URL ({app.courseUrl}) instantly without needing to download files.
                  </p>
                </div>

                {/* Direct Link Box */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Direct Mobile Test Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={testUrl}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedLink ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={testUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                  </div>
                </div>

                {/* PWA / WebAPK installation tip */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-emerald-900">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Install to Android Home Screen (WebAPK):
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    When opened in Chrome on Android, tap the three dots ($\vdots$) $\rightarrow$ tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>. Android creates an authentic native WebAPK with your exact icon and splash screen!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID INSTALL GUIDE */}
          {activeTab === 'instructions' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Android Sideloading Walkthrough (Android 10, 11, 12, 13, 14+)
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900">Locate the file in Downloads:</strong>
                      <p className="text-slate-500 text-[11px]">
                        Open the <strong>Files</strong> or <strong>My Files</strong> app on your Android device and navigate to <strong>Downloads</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900">Enable "Install Unknown Apps":</strong>
                      <p className="text-slate-500 text-[11px]">
                        Tap on the <code>.apk</code> file. If prompted with <em>"For your security, your phone is not allowed to install unknown apps from this source"</em>, tap <strong>Settings</strong>, toggle ON <strong>Allow from this source</strong>, and press the back arrow.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900">Complete Installation:</strong>
                      <p className="text-slate-500 text-[11px]">
                        Tap <strong>Install</strong>. Android will verify the package and add the application icon for <strong>{app.appName}</strong> directly to your app drawer and home screen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4 border border-blue-200">
                <div>
                  <span className="font-bold text-blue-950 block">Ready to try it?</span>
                  <span className="text-[11px] text-blue-700">Download the test APK package now to begin sideloading.</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadApk}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .APK
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUD BUILD (GITHUB ACTIONS) */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900 p-4 text-white text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Terminal className="h-4 w-4" />
                    GitHub Actions Cloud Compiler
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">.github/workflows/android-build.yml</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  The project includes a ready-to-run GitHub Actions CI workflow that compiles both production <strong>.AAB</strong> (for Play Store) and signed <strong>.APK</strong> (for direct device distribution) on Ubuntu cloud runners.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">How to build signed APK on GitHub:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                  <li>Download the project ZIP and push to GitHub repository.</li>
                  <li>Click <strong>Actions</strong> tab $\rightarrow$ select <strong>"Build Branded Android App (.AAB)"</strong>.</li>
                  <li>Under Build Type, select <strong>"both"</strong> or <strong>"apk"</strong> and click <strong>"Run workflow"</strong>.</li>
                  <li>In ~2 minutes, your compiled 15MB release .apk and .aab files will be available for direct download under <strong>Artifacts</strong>!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Target SDK 34 • Android 14+ Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadApk}
              disabled={isDownloadingApk}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {isDownloadingApk ? 'Downloading...' : 'Download Test .APK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
