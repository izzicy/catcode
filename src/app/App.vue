<script setup lang="ts">
import { interpreter } from '../catcode/interpreter';
import { parse } from '../catcode/parser';
import { tokenize } from '../catcode/tokenizer';
import { interpreter as screenInterpreter } from '../catcode/screens/interpreter';
import { parse as screenParse } from '../catcode/screens/parser';
import { tokenize as screenTokenize } from '../catcode/screens/tokenizer';
import { computed, ref } from 'vue';
import { screenObjectStringifier } from '../catcode/screenObjectStringifier';

const screenText = ref('');
const programText = ref('');
const screenData = ref<{ [key: string]: number[][] }>({});

const process = () => {
    screenData.value = screenInterpreter(screenParse(screenTokenize(screenText.value)));
    screenData.value = interpreter(parse(tokenize(programText.value)), screenData.value);

    screenText.value = screenObjectStringifier(screenData.value);
};
</script>

<template>
  <label for="screen">Screen</label>
  <textarea id="screen" v-model="programText" col="20" style="width: 320px;"></textarea>
  <textarea id="screen" v-model="screenText" col="20" style="width: 320px;"></textarea>
  <button @click="process">Process</button>
</template>
