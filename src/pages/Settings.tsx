import React from 'react';
import { db } from '../lib/db';
import { Trash2, Bell, Shield, Database, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const handleClearData = async () => {
    if (confirm('すべてのデータを消去してもよろしいですか？この操作は取り消せません。')) {
      await db.tasks.clear();
      await db.sessions.clear();
      window.location.reload();
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      alert(`通知権限: ${permission}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">設定</h2>
        <p className="text-zinc-500 text-sm mt-1">ワークスペースの設定とデータの管理を行います。</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border flex items-center gap-3">
            <Bell size={20} className="text-accent" />
            <h3 className="font-bold">通知</h3>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">ブラウザ通知</p>
                <p className="text-xs text-zinc-500">集中セッション完了時にアラートを受け取ります。</p>
              </div>
              <button 
                onClick={requestNotificationPermission}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors w-full sm:w-auto"
              >
                権限をリクエスト
              </button>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border flex items-center gap-3">
            <Database size={20} className="text-red-500" />
            <h3 className="font-bold">データ管理</h3>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">すべてのデータを消去</p>
                <p className="text-xs text-zinc-500">IndexedDBからすべてのタスクと履歴を永久に削除します。</p>
              </div>
              <button 
                onClick={handleClearData}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-bg px-4 py-2 rounded-lg text-xs font-bold transition-all w-full sm:w-auto"
              >
                <Trash2 size={14} className="inline mr-2" />
                データベースをクリア
              </button>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border flex items-center gap-3">
            <Info size={20} className="text-blue-500" />
            <h3 className="font-bold">Nexusについて</h3>
          </div>
          <div className="p-4 md:p-6 space-y-2">
            <p className="text-sm text-zinc-400">
              Nexusは、ハイパフォーマンスなワークフローのために設計されたオフラインファーストのタスク管理スイートです。
              データはIndexedDBを使用してブラウザ内にローカルに保存されます。
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              <span>Version 1.2.0</span>
              <span>•</span>
              <span>Build 2026.02.27</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
