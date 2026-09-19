<script setup lang="ts">
import { TemplateFeatures } from '@/widgets/template-features'
import { TemplateHero } from '@/widgets/template-hero'
import { TemplateStructure } from '@/widgets/template-structure'
</script>

<template>
  <main class="min-h-screen overflow-hidden">
    <TemplateHero />
    <TemplateFeatures />
    <TemplateStructure />
  </main>
</template>
