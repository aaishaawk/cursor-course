"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, Zap, TrendingUp, BookOpen, Tag, Terminal, Sparkles, ArrowRight } from "lucide-react"
import AuthButton from "./components/AuthButton"
import ProtectedLink from "./components/ProtectedLink"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Blingo</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="cursor-pointer font-medium hover:bg-amber-50 rounded-lg">
              <a href="#pricing">Pricing</a>
            </Button>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32 md:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block px-4 py-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-full text-sm font-semibold shadow-sm">
            🎮 Powered by Doom 64 Technology
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-pretty">Deep Dive into Open Source</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Analyze GitHub repositories with instant insights. Discover stars, pull requests, version updates, cool
            facts, and everything you need to know about open source projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
            <ProtectedLink
              href="/dashboards"
              className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-lg shadow-amber-400/25 hover:shadow-xl hover:shadow-amber-400/30 hover:-translate-y-0.5 h-12 px-7 rounded-xl cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </ProtectedLink>
            <Button variant="outline" size="lg" asChild className="cursor-pointer bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl h-12 px-7 font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
              <a href="#features" className="flex items-center justify-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 md:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-pretty">Powerful Analytics at Your Fingertips</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 space-y-4 border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Repository Summary</h3>
              <p className="text-muted-foreground">
                Get instant overviews of any GitHub repository with key metrics and stats.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 space-y-4 border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Star Trends</h3>
              <p className="text-muted-foreground">
                Track star growth and understand repository popularity trends over time.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 space-y-4 border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Cool Facts</h3>
              <p className="text-muted-foreground">
                Discover interesting statistics and unique insights about open source projects.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 space-y-4 border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Pull Request Analysis</h3>
              <p className="text-muted-foreground">
                View the latest important pull requests and stay updated on project development.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 space-y-4 border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Version Updates</h3>
              <p className="text-muted-foreground">
                Track releases and version updates to stay current with project evolution.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 space-y-4 border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Github className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Multi-Repo Tracking</h3>
              <p className="text-muted-foreground">
                Monitor multiple repositories and compare metrics across your favorite projects.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-20 md:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-pretty">Simple, Transparent Pricing</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Start free and upgrade whenever you need more power.
          </p>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3">
            {/* Free Tier */}
            <Card className="p-6 sm:p-8 space-y-6 border-border relative">
              <div>
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-muted-foreground text-sm mt-1">Perfect for exploration</p>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-bold">Free</span>
                <p className="text-muted-foreground text-sm">Forever</p>
              </div>
              <ProtectedLink
                href="/dashboards"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-gray-200 bg-white/80 hover:bg-white hover:border-gray-300 shadow-sm hover:shadow-md h-11 px-4 py-2 w-full cursor-pointer rounded-xl hover:-translate-y-0.5"
              >
                Get Started
              </ProtectedLink>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>5 repository analyses per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Basic summaries & stats</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Latest 10 pull requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">✗</span>
                  <span className="text-muted-foreground">Advanced analytics</span>
                </li>
              </ul>
            </Card>

            {/* Pro Tier */}
            <Card className="p-6 sm:p-8 space-y-6 border-amber-400 border-2 relative md:scale-105 md:-my-2 shadow-lg shadow-amber-100 order-first md:order-none">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                POPULAR
              </div>
              <div>
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-muted-foreground text-sm mt-1">For serious developers</p>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-bold">$29</span>
                <p className="text-muted-foreground text-sm">/month</p>
              </div>
              <ProtectedLink
                href="/dashboards"
                className="group inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-lg shadow-amber-400/25 hover:shadow-xl hover:shadow-amber-400/30 h-11 px-4 py-2 w-full cursor-pointer rounded-xl hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                Start Pro Trial
              </ProtectedLink>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Unlimited repository analyses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Advanced analytics & trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Latest 50 pull requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Version history tracking</span>
                </li>
              </ul>
            </Card>

            {/* Enterprise Tier */}
            <Card className="p-6 sm:p-8 space-y-6 border-border">
              <div>
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <p className="text-muted-foreground text-sm mt-1">For teams & organizations</p>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-bold">Custom</span>
                <p className="text-muted-foreground text-sm">Let's talk</p>
              </div>
              <Button variant="outline" className="w-full bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl h-11 font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md" asChild>
                <a href="#contact">Contact Sales</a>
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Team collaboration tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>API access & webhooks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Dedicated support</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 md:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-pretty">Ready to Unlock GitHub Insights?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Join thousands of developers analyzing open source projects with Blingo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <ProtectedLink
              href="/dashboards"
              className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-lg shadow-amber-400/25 hover:shadow-xl hover:shadow-amber-400/30 hover:-translate-y-0.5 h-12 px-7 rounded-xl cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              Sign Up Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </ProtectedLink>
            <Button variant="outline" size="lg" asChild className="cursor-pointer bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl h-12 px-7 font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
              <a href="#pricing" className="flex items-center justify-center gap-2">
                <Tag className="w-4 h-4" />
                View Pricing
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 md:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Github className="w-6 h-6 text-primary" />
                <span className="font-bold">Blingo</span>
              </div>
              <p className="text-muted-foreground text-sm">Deep insights into open source repositories.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#">API Docs</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#">Privacy</a>
                </li>
                <li>
                  <a href="#">Terms</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2026 Blingo GitHub Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper component for Star icon
function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
