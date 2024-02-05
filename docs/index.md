---
layout: home

title: VitePress
titleTemplate: Vite & Vue Powered Static Site Generator

hero:
  name: Sparkle Engine
  text: 使用简单，快速的游戏引擎 🎮
  tagline: 简单的游戏引擎，还在制作 🕹️
  actions:
    - theme: brand
      text: 现在就开始
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/vuejs/vitepress
  image:
    src: /logo.svg
    alt: Sparkle Engine

features:
  - icon: 📝
    title: 零依赖
    details: 没有依赖
  - icon: 💼
    title: 简易
    details: Instant server start, lightning fast hot updates, and leverage Vite ecosystem plugins.
  - icon: 🎴
    title: Customize with Vue
    details: Use Vue syntax and components directly in markdown, or build custom themes with Vue.
  - icon: 🚀
    title: 碰撞
    details: 使用SAT碰撞
---


<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #f9c23c 30%, #fa83a9);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #f9c23c 50%, #fa83a9 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>