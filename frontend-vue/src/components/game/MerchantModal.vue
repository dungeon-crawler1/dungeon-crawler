<template>
  <div
    :style="{ border: `2px solid ${isLuxury ? '#a855f7' : '#28a745'}`, padding: '20px', borderRadius: '8px', background: isLuxury ? '#241734' : '#1c2b1e', color: '#fff', marginTop: '15px' }"
  >
    <h3>{{ isLuxury ? '💎 Mercader de Lujo - Reliquias Avanzadas' : '🛒 Mercader Común - Tienda de la Mazmorra' }}</h3>
    <p>Tu Oro Disponible: 🪙 <strong>{{ playerGold }}</strong></p>

    <div v-if="!hasRelic" style="padding: 8px 12px; background: #333; border-radius: 4px; margin-bottom: 10px; font-size: 0.85em; color: #ffd166;">
      ℹ️ No hay más reliquias únicas disponibles para vender en este mercader.
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px;">
      <div v-for="item in items" :key="item.id" style="border: 1px solid #555; padding: 12px; border-radius: 6px; background: #111;">
        <strong>{{ item.name }}</strong> <small>({{ item.type }})</small>
        <p style="font-size: 0.82em; margin: 6px 0; min-height: 38px;">{{ item.description }}</p>
        <button
          type="button"
          :disabled="disabled || playerGold < item.price"
          :style="{ padding: '6px 12px', background: playerGold >= item.price ? '#28a745' : '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }"
          @click="$emit('buy', item)"
        >
          Comprar (🪙 {{ item.price }})
        </button>
      </div>
    </div>
    <button
      type="button"
      :disabled="disabled"
      style="margin-top: 15px; padding: 8px 14px; background: #6c757d; color: #fff; border: none; border-radius: 4px; cursor: pointer;"
      @click="$emit('close')"
    >
      Continuar Explorando
    </button>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// MODAL DE TIENDA DEL MERCADER (COMÚN Y DE LUJO)
// =============================================================================
import { computed } from 'vue';
import type { ShopItem } from '../../types/game';

const props = defineProps<{ items: ShopItem[]; isLuxury: boolean; playerGold: number; disabled: boolean }>();
defineEmits<{ buy: [item: ShopItem]; close: [] }>();

const hasRelic = computed(() => props.items.some((item) => item.type === 'RELIQUIA'));
</script>
