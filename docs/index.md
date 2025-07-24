---
layout: home

hero:
  name: "Testring"
  text: "Modern UI Testing Framework"
  tagline: "A powerful Node.js-based automated UI testing framework for web applications"
  image:
    src: /logo.svg
    alt: Testring Logo
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/
    - theme: alt
      text: View on GitHub
      link: https://github.com/ringcentral/testring

features:
  - icon: ⚡
    title: Multi-Process Parallel Execution
    details: Run tests simultaneously with process isolation for maximum performance and reliability.

  - icon: 🌐
    title: Multi-Browser Support
    details: Support for Chrome, Firefox, Safari, Edge with both Selenium and Playwright drivers.

  - icon: 🔧
    title: Rich Plugin System
    details: Extensible architecture with comprehensive plugin support for custom functionality.

  - icon: 🐛
    title: Advanced Debugging
    details: Built-in debugging tools, breakpoints, and comprehensive error reporting.

  - icon: 🚀
    title: CI/CD Ready
    details: Seamless integration with continuous integration systems and cloud platforms.

  - icon: 📦
    title: Modern Architecture
    details: TypeScript support, modern JavaScript features, and clean modular design.
---

## Quick Start

Get up and running with Testring in minutes:

```bash
# Install testring
npm install --save-dev testring

# Run tests
testring run

# Run with specific configuration
testring run --config ./test.config.js
```

## Why Testring?

<div class="feature-grid">
  <div class="feature-card">
    <h3>🎯 Developer-Focused</h3>
    <p>Built by developers for developers with modern tooling and best practices in mind.</p>
  </div>
  
  <div class="feature-card">
    <h3>🔄 Flexible Architecture</h3>
    <p>Modular design allows you to use only what you need and extend functionality easily.</p>
  </div>
  
  <div class="feature-card">
    <h3>⚡ High Performance</h3>
    <p>Optimized for speed with parallel execution and efficient resource management.</p>
  </div>
  
  <div class="feature-card">
    <h3>🛡️ Reliable Testing</h3>
    <p>Stable test execution with retry mechanisms and robust error handling.</p>
  </div>
</div>

## Core Modules

Testring is built on a foundation of core modules:

- <span class="badge core">API</span> **Test Execution API** - Core testing engine and execution framework
- <span class="badge core">CLI</span> **Command Line Interface** - Easy-to-use command line tools
- <span class="badge core">Types</span> **TypeScript Definitions** - Complete type safety and IntelliSense
- <span class="badge core">Transport</span> **Communication Layer** - Inter-process communication system

## Extension Packages

Extend Testring with powerful packages:

- <span class="badge package">Playwright Driver</span> **Modern Browser Automation** - Latest browser automation technology
- <span class="badge package">Browser Proxy</span> **Network Interception** - Advanced network testing capabilities
- <span class="badge package">DevTools</span> **Development Tools** - Debugging and development utilities
- <span class="badge package">Plugins</span> **Custom Extensions** - Babel, FS Store, and custom drivers

## Community & Support

<div class="feature-grid">
  <div class="feature-card">
    <h3>📚 Documentation</h3>
    <p>Comprehensive guides, API references, and examples to help you succeed.</p>
    <a href="/guides/">Browse Guides →</a>
  </div>
  
  <div class="feature-card">
    <h3>🤝 Contributing</h3>
    <p>Join our community of contributors and help make Testring even better.</p>
    <a href="/guides/contributing">Learn How →</a>
  </div>
  
  <div class="feature-card">
    <h3>🐛 Issue Tracking</h3>
    <p>Report bugs, request features, and get help from the community.</p>
    <a href="https://github.com/ringcentral/testring/issues" target="_blank">GitHub Issues →</a>
  </div>
  
  <div class="feature-card">
    <h3>💬 Discussions</h3>
    <p>Connect with other users and share your experiences with Testring.</p>
    <a href="https://github.com/ringcentral/testring/discussions" target="_blank">Join Discussion →</a>
  </div>
</div> 