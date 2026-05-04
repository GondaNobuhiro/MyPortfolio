'use client';

import React, { useState, useEffect } from 'react';
import type { ScreenMode, ItemData } from '@/types/game';
import { PLAYER_DATA, SKILLS } from '@/data/playerData';

interface StatusScreenProps {
  screen: ScreenMode;
  onClose: () => void;
  items: ItemData[];
}

type Tab = 'status' | 'skills' | 'items' | 'contact';
type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

const TAB_LABELS: Record<Tab, string> = {
  status:  'ステータス',
  skills:  'スキル',
  items:   'アイテム',
  contact: 'れんらく',
};

const HEADER_LABELS: Record<Tab, string> = {
  status:  '【ステータス】',
  skills:  '【スキルリスト】',
  items:   '【アイテムリスト】',
  contact: '【お問い合わせ】',
};

export default function StatusScreen({ screen, onClose, items }: StatusScreenProps) {
  const [tab, setTab]             = useState<Tab>('status');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [form, setForm]           = useState({ name: '', email: '', message: '', botcheck: '' });
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');

  useEffect(() => {
    if (screen === 'game') {
      setTab('status');
      setPreviewSrc(null);
      setForm({ name: '', email: '', message: '', botcheck: '' });
      setSendStatus('idle');
    }
  }, [screen]);

  if (screen === 'game') return null;

  const categories = [...new Set(SKILLS.map(s => s.category))];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSendStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: 'ポートフォリオからのお問い合わせ',
          botcheck: form.botcheck,
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      const data = await res.json();
      setSendStatus(data.success ? 'sent' : 'error');
    } catch {
      setSendStatus('error');
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="border-4 border-white bg-blue-950 text-white font-pixel p-4 w-full max-w-lg mx-2 flex flex-col"
        style={{ maxHeight: '90%' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center mb-3 border-b-2 border-blue-700 pb-2">
          <span className="text-yellow-300 text-base">{HEADER_LABELS[tab]}</span>
          <button
            className="text-xs text-blue-300 hover:text-white px-2 py-1 border border-blue-500"
            onClick={onClose}
          >
            閉じる [Esc]
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex gap-2 mb-4 flex-wrap">
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
            <button
              key={t}
              className={`px-3 py-1 text-xs border ${tab === t ? 'border-yellow-400 text-yellow-300 bg-blue-900' : 'border-blue-600 text-blue-300'}`}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── アイテム ── */}
          {tab === 'items' && (
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-xs text-blue-300 text-center py-6">
                  アイテムはまだ持っていない。
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="border border-blue-700 p-3 bg-blue-900/40 flex gap-3">
                    {item.imagePath && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imagePath}
                        alt={item.name}
                        className="flex-shrink-0 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ width: 80, height: 80, imageRendering: 'pixelated' }}
                        onClick={() => setPreviewSrc(item.imagePath!)}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-yellow-300 text-sm mb-1">【{item.name}】</div>
                      {item.description && (
                        <div className="text-xs text-gray-300 mb-2">{item.description}</div>
                      )}
                      {item.details && item.details.length > 0 && (
                        <div className="space-y-0.5">
                          {item.details.map((line, i) => (
                            <div key={i} className="text-xs text-blue-200 font-pixel">{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── ステータス ── */}
          {tab === 'status' && (
            <div className="space-y-4">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-blue-400 text-xs">なまえ</span>
                  <div className="text-yellow-200">{PLAYER_DATA.name}</div>
                </div>
                <div>
                  <span className="text-blue-400 text-xs">しょくぎょう</span>
                  <div className="text-yellow-200">{PLAYER_DATA.job}</div>
                </div>
                <div>
                  <span className="text-blue-400 text-xs">レベル</span>
                  <div className="text-yellow-200">{PLAYER_DATA.level}</div>
                </div>
              </div>

              <div className="flex gap-8 text-sm">
                <div>
                  <span className="text-red-400 text-xs">HP</span>
                  <div className="text-white">{PLAYER_DATA.hp.current} / {PLAYER_DATA.hp.max}</div>
                  <div className="w-28 h-3 bg-gray-900 border border-red-700 mt-1">
                    <div className="h-full bg-red-500" style={{ width: `${(PLAYER_DATA.hp.current / PLAYER_DATA.hp.max) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <span className="text-blue-400 text-xs">MP</span>
                  <div className="text-white">{PLAYER_DATA.mp.current} / {PLAYER_DATA.mp.max}</div>
                  <div className="w-28 h-3 bg-gray-900 border border-blue-700 mt-1">
                    <div className="h-full bg-blue-500" style={{ width: `${(PLAYER_DATA.mp.current / PLAYER_DATA.mp.max) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-blue-400 mb-2">保有資格</div>
                <div className="space-y-1">
                  {PLAYER_DATA.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-yellow-400">★</span>
                      <span className="text-gray-200">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-blue-700 pt-3">
                <div className="text-xs text-blue-400 mb-1">プロフィール</div>
                {PLAYER_DATA.bio.map((line, i) => (
                  <div key={i} className="text-xs text-gray-200">{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── スキル ── */}
          {tab === 'skills' && (
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat}>
                  <div className="text-yellow-300 text-xs mb-2 border-b border-blue-700 pb-1">{cat}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {SKILLS.filter(s => s.category === cat).map(skill => (
                      <div key={skill.name} className="flex items-center gap-2 text-xs">
                        {skill.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={skill.icon}
                            alt={skill.name}
                            className="w-5 h-5 rounded bg-white p-0.5 shrink-0"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                          />
                        ) : (
                          <div className="w-5 h-5 shrink-0" />
                        )}
                        <span className="text-gray-200">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── れんらく ── */}
          {tab === 'contact' && (
            <div>
              {sendStatus === 'sent' ? (
                <div className="text-center py-8 space-y-3">
                  <div className="text-yellow-300 text-sm">✉ 送信完了！</div>
                  <div className="text-xs text-gray-300">お問い合わせありがとうございます。</div>
                  <div className="text-xs text-gray-300">折り返しご連絡いたします。</div>
                  <button
                    className="mt-4 px-4 py-1 text-xs border border-blue-500 text-blue-300 hover:text-white hover:border-white"
                    onClick={() => { setForm({ name: '', email: '', message: '', botcheck: '' }); setSendStatus('idle'); }}
                  >
                    もう一度送る
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* honeypot: bots fill this, humans don't — Web3Forms blocks the submission */}
                  <input
                    type="checkbox"
                    name="botcheck"
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    checked={form.botcheck === 'on'}
                    onChange={e => setForm(f => ({ ...f, botcheck: e.target.checked ? 'on' : '' }))}
                  />

                  <div className="text-xs text-blue-300 mb-3">
                    ご質問・ご連絡はこちらからどうぞ。
                  </div>

                  <div>
                    <label className="block text-xs text-blue-400 mb-1">おなまえ</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-blue-900 border border-blue-600 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-yellow-400"
                      placeholder="山田 太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-blue-400 mb-1">メールアドレス</label>
                    <input
                      type="email"
                      required
                      maxLength={200}
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-blue-900 border border-blue-600 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-yellow-400"
                      placeholder="example@mail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-blue-400 mb-1">お問い合わせ内容</label>
                    <textarea
                      required
                      maxLength={2000}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      rows={4}
                      className="w-full bg-blue-900 border border-blue-600 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-yellow-400 resize-none"
                      placeholder="お気軽にどうぞ..."
                    />
                  </div>

                  {sendStatus === 'error' && (
                    <div className="text-xs text-red-400">
                      送信に失敗しました。時間をおいて再度お試しください。
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sendStatus === 'sending'}
                    className="w-full py-2 text-xs border border-yellow-400 text-yellow-300 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendStatus === 'sending' ? '送信中...' : '送る ▶'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>{/* scroll wrapper end */}
      </div>

      {previewSrc && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/80"
          onClick={e => { e.stopPropagation(); setPreviewSrc(null); }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="preview"
            className="max-w-full max-h-full"
            style={{ imageRendering: 'pixelated' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
