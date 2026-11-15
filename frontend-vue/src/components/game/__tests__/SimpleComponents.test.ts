import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ClassSelector from '../ClassSelector.vue';
import DoorSelector from '../DoorSelector.vue';
import EventModal from '../EventModal.vue';
import GameLog from '../GameLog.vue';
import GameSummary from '../GameSummary.vue';
import LeaveConfirmModal from '../LeaveConfirmModal.vue';
import RelicsDropdown from '../RelicsDropdown.vue';
import MerchantModal from '../MerchantModal.vue';
import { makeItem } from '../../../test/fixtures';

const door = { id: 'door-1', type: 'COMBAT' as const, icon: '⚔️', title: 'Cámara de Combate', description: 'Enemigos.' };
const relic = { id: 'rel-1', name: 'Afilador', effectSummary: '+10 Daño', description: 'Suma daño.' };

describe('ClassSelector', () => {
  it('muestra las cuatro clases y emite la elegida', async () => {
    const wrapper = mount(ClassSelector, { props: { disabled: false } });
    expect(wrapper.findAll('button')).toHaveLength(4);
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('select')?.[0]).toEqual(['CABALLERO']);
  });

  it('deshabilita los botones mientras inicia', () => {
    const wrapper = mount(ClassSelector, { props: { disabled: true } });
    expect(wrapper.text()).toContain('Iniciando...');
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});

describe('DoorSelector', () => {
  it('lista las puertas y emite la elegida', async () => {
    const wrapper = mount(DoorSelector, { props: { doors: [door], disabled: false } });
    expect(wrapper.text()).toContain('Cámara de Combate');
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('choose')?.[0]).toEqual([door]);
  });
});

describe('EventModal', () => {
  it('emite aceptar e ignorar', async () => {
    const event = { title: 'Tesoro', description: 'Cofre.', type: 'TREASURE' as const };
    const wrapper = mount(EventModal, { props: { event } });
    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('resolve')).toEqual([['ACCEPT'], ['IGNORE']]);
  });
});

describe('GameLog', () => {
  it('renderiza las entradas de la bitácora', () => {
    const wrapper = mount(GameLog, { props: { logs: ['primera', 'segunda'] } });
    expect(wrapper.findAll('li')).toHaveLength(2);
    expect(wrapper.text()).toContain('primera');
  });
});

describe('GameSummary', () => {
  it('muestra la derrota y emite reinicio e inicio', async () => {
    const wrapper = mount(GameSummary, { props: { reason: 'DERROTA', score: 3, gold: 40 } });
    expect(wrapper.text()).toContain('Has Caído');
    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('restart')).toHaveLength(1);
    expect(wrapper.emitted('go-home')).toHaveLength(1);
  });

  it('muestra el retiro voluntario', () => {
    const wrapper = mount(GameSummary, { props: { reason: 'VICTORIA_RETIRO', score: 1, gold: 5 } });
    expect(wrapper.text()).toContain('Partida Finalizada por Retiro');
  });
});

describe('LeaveConfirmModal', () => {
  it('emite confirmar y cancelar', async () => {
    const wrapper = mount(LeaveConfirmModal);
    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('confirm')).toHaveLength(1);
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });
});

describe('RelicsDropdown', () => {
  it('abre y muestra las reliquias equipadas', async () => {
    const wrapper = mount(RelicsDropdown, { props: { relics: [relic] } });
    expect(wrapper.text()).toContain('Artefactos Equipados (1)');
    await wrapper.find('button').trigger('click');
    expect(wrapper.text()).toContain('Afilador');
    expect(wrapper.text()).toContain('+10 Daño');
  });

  it('informa cuando no hay reliquias', async () => {
    const wrapper = mount(RelicsDropdown, { props: { relics: [] } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.text()).toContain('Aún no posees');
  });
});

describe('MerchantModal', () => {
  it('compra artículos y cierra la tienda', async () => {
    const items = [makeItem({ id: 'pot-1', name: 'Poción', type: 'POCION', price: 30 })];
    const wrapper = mount(MerchantModal, { props: { items, isLuxury: false, playerGold: 100, disabled: false } });
    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('buy')?.[0]).toEqual([items[0]]);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('deshabilita la compra sin oro y avisa si no hay reliquias', () => {
    const items = [makeItem({ id: 'pot-1', type: 'POCION', price: 500 })];
    const wrapper = mount(MerchantModal, { props: { items, isLuxury: true, playerGold: 10, disabled: false } });
    expect(wrapper.text()).toContain('Mercader de Lujo');
    expect(wrapper.text()).toContain('No hay más reliquias');
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
