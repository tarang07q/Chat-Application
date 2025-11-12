'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-gray-400">Now with AI-powered features</span>
            </div>

            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Chat.<br />Connect.<br />Collaborate.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto">
              Experience the future of team communication with{' '}
              <span className="text-white font-semibold">real-time messaging</span>,{' '}
              <span className="text-white font-semibold">AI assistance</span>, and{' '}
              <span className="text-white font-semibold">seamless collaboration</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all overflow-hidden"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Real-time messaging with sub-50ms latency. Experience instant communication.',
                gradient: 'from-yellow-500/10 to-orange-500/10'
              },
              {
                icon: '🔒',
                title: 'End-to-End Encrypted',
                description: 'Military-grade encryption keeps your conversations private and secure.',
                gradient: 'from-blue-500/10 to-cyan-500/10'
              },
              {
                icon: '🤖',
                title: 'AI-Powered',
                description: 'Smart replies, message summaries, and intelligent search powered by AI.',
                gradient: 'from-purple-500/10 to-pink-500/10'
              },
              {
                icon: '👥',
                title: 'Team Collaboration',
                description: 'Create channels, groups, and organize your team communication effortlessly.',
                gradient: 'from-green-500/10 to-emerald-500/10'
              },
              {
                icon: '📁',
                title: 'File Sharing',
                description: 'Share documents, images, and files up to 100MB with drag-and-drop ease.',
                gradient: 'from-red-500/10 to-rose-500/10'
              },
              {
                icon: '🌐',
                title: 'Cross-Platform',
                description: 'Available on web, desktop, and mobile. Stay connected anywhere, anytime.',
                gradient: 'from-indigo-500/10 to-violet-500/10'
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '10M+', label: 'Messages Daily' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<50ms', label: 'Avg Latency' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className="text-gray-500 text-sm mb-4">
              Trusted by teams at leading companies worldwide
            </p>
            <div className="flex justify-center items-center gap-8 opacity-30">
              <div className="text-2xl font-bold text-white">ACME</div>
              <div className="text-2xl font-bold text-white">TechCorp</div>
              <div className="text-2xl font-bold text-white">StartupHub</div>
              <div className="text-2xl font-bold text-white">DevTeam</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
