# DRE Lab — Documentación Funcional y Técnica

Este documento describe cómo funciona la página `/private/finance/dre`, qué significa cada tab, qué bloques se muestran, qué utilidad tiene cada uno y cómo se alimentan desde las APIs del BI DWH.

La implementación actual usa datos reales del backend. No quedan datos mockeados ni fallbacks inventados para métricas financieras. Cuando la API no trae un campo, el front no simula ese valor: oculta el bloque, muestra `—` o presenta una lectura alternativa basada solo en los campos disponibles.

## Flujo General de Datos

La página usa el hook `useLabDre`, que consulta el BI DWH y normaliza las respuestas en `normalizeLabDreBiDwhBundle`.

APIs usadas:

| API | Uso |
| --- | --- |
| `GET /bi_dwh/v1/dre/` | Resumen del periodo seleccionado: KPIs, P&L, márgenes, OPEX, EBITDA/EBIT. |
| `GET /bi_dwh/v1/dre/` con ventana de 6 meses | Serie mensual para evolución temporal, gráficos y tendencias. |
| `GET /bi_dwh/v1/dre/by-class/?group_by=classe` | Mix por clase, receita por clase, markup efectivo, share y evolución mensual por categoría. |
| `GET /bi_dwh/v1/dre/by-class/?group_by=cogs_classe` | Markup y desglose por categoría de COGS para el periodo seleccionado. |

Parámetros principales:

| Parámetro | Descripción |
| --- | --- |
| `store_id` | Tienda seleccionada. Puede repetirse como array, aunque hoy usamos una tienda. |
| `date_from` / `date_to` | Rango calculado desde la pill de periodo. |
| `period` | `daily`, `monthly`, `quarterly` o `annual`, según el periodo seleccionado. |
| `compare_to` | Siempre `previous_period` en el flujo actual. |
| `group_by` | Solo en `by-class`: `classe` o `cogs_classe`. |

Reglas de periodo:

| UI | Query BI |
| --- | --- |
| `MTD` | Desde el primer día del mes actual hasta hoy, con `period=daily`. |
| Mes cerrado, por ejemplo `Mar 2026` | Mes completo, con `period=monthly`. |
| `Q1 2026` | Enero a marzo, con `period=quarterly`. |
| `YTD` | Enero hasta hoy, con `period=monthly`. |

Importante: primero se consulta el resumen principal (`/bi_dwh/v1/dre/`) para el periodo seleccionado. Si la API responde `data: []`, la UI muestra estado vacío y no normaliza ceros. En ese caso tampoco dispara las consultas dependientes.

## Shape Esperado del BI

El contrato más usado por la normalización es:

```json
{
  "meta": {
    "store_ids": ["16"],
    "date_from": "2026-03-01",
    "date_to": "2026-03-31",
    "period": "monthly",
    "compare_to": "previous_period"
  },
  "data": [
    {
      "period": "2026-03-01",
      "store_id": 16,
      "store_name": "Center Norte",
      "metrics": {
        "net_revenue": { "actual": 116128.96, "prev": 72332.92, "var_pct": 0.6055 },
        "cogs": { "actual": -48704.96 },
        "gross_profit": { "actual": 64943.33 },
        "gross_margin_pct": { "actual": 0.6331 },
        "total_opex": { "actual": -5059.11 },
        "discount_amount": { "actual": -40210.98 },
        "pct_desconto_bruta": { "actual": 23.421 },
        "ebit": { "actual": 59884.22 },
        "net_margin_pct": { "actual": 0.5896 }
      }
    }
  ]
}
```

Campos con `actual`, `prev` y `var_pct` se interpretan como valor actual, valor anterior y variación. Los ratios pueden venir como fracción (`0.6331`) o porcentaje (`63.31`); el normalizador convierte a porcentaje de display.

## Tab: Visão Geral

La pestaña `Visão geral` responde a la pregunta: "¿Cómo está la rentabilidad de la tienda en el periodo seleccionado?".

### Cards Principales

Bloque:

- `Receita líquida`
- `Margem bruta`
- `Despesas operacionais`
- `EBITDA (4-wall)`

Utilidad:

- Da una lectura rápida del estado financiero del periodo.
- Permite comparar contra el periodo anterior con variaciones porcentuales o absolutas.
- Evita tener que abrir la tabla para entender si la tienda está creciendo, perdiendo margen o aumentando gastos.

Campos usados:

| Card | Campos BI |
| --- | --- |
| `Receita líquida` | `net_revenue.actual`, `net_revenue.prev`, `net_revenue.var_pct` |
| `Margem bruta` | `gross_margin_pct.actual`, `gross_profit.actual`, `net_revenue.actual` |
| `Despesas operacionais` | `total_opex.actual`, `total_opex.prev`, `total_opex.var_pct`, `net_revenue.actual` |
| `EBITDA (4-wall)` | `ebitda.actual` si existe; fallback a `ebit.actual` porque el contrato actual manda `ebit` |

Notas de implementación:

- `EBITDA (4-wall)` muestra el subtítulo `valor BI: EBIT` cuando el backend no manda `ebitda` y usamos `ebit`.
- Las cuatro cards ocupan todo el ancho en desktop (`xl:grid-cols-4`).
- Ya no existe quinta columna reservada; se eliminó el espacio vacío a la derecha.

### Tabla P&L

Bloque: `P&L — {storeName} ({monthLabel})`

Utilidad:

- Expone la composición de la rentabilidad: receita, deducciones, COGS, OPEX y resultado.
- Permite abrir líneas expandibles para ver más detalle por clase o COGS cuando el BI trae datos por `by-class`.

Campos usados:

| Línea | Campos BI |
| --- | --- |
| Receita líquida | `net_revenue` |
| Deducciones | `discount_amount`, `returns_amount`, `taxes`, `total_deducoes` |
| COGS | `cogs` |
| Despesas operacionais | `total_opex`, `marketing`, `royalties`, `payment_fees`, `opex_*` |
| Resultado | `gross_profit`, `ebit` / `ebitda` |

Datos adicionales:

- Hijos de receita por clase: `by-class group_by=classe`, principalmente `metrics.net_revenue`.
- Hijos de COGS por clase: `by-class group_by=cogs_classe`, principalmente `metrics.cogs`.

Qué se hizo:

- Se adaptó el normalizador para leer el contrato real `{ meta, data: [{ metrics }] }`.
- Antes el normalizador buscaba métricas en la raíz; ahora toma `data[0].metrics`.
- Se agregaron aliases reales como `returns_amount`, `discount_amount`, `total_deducoes`, `ebit`.

### Margens vs. Meta

Bloque lateral que compara:

- Margem bruta
- Margem EBITDA
- OPEX / receita líquida
- Markup efectivo cuando hay dato

Utilidad:

- Ayuda a saber si el problema está en margen, OPEX o composición.
- Sirve como lectura ejecutiva, más visual que la tabla.

Campos usados:

| Métrica | Campos BI |
| --- | --- |
| Margem bruta | `gross_margin_pct.actual` o cálculo `gross_profit / net_revenue` |
| Margem EBITDA | `ebit` o `ebitda` dividido por `net_revenue` |
| OPEX / receita | `total_opex / net_revenue` |
| Markup | `markup_x` cuando viene en ratios o por clase |

### Bridge Receita -> EBITDA

Utilidad:

- Muestra una lectura tipo waterfall simplificado desde receita líquida hasta EBITDA/EBIT.
- Ayuda a visualizar cuánto pesan COGS y gastos operativos.

Campos usados:

- `net_revenue`
- `cogs`
- `gross_profit`
- `total_opex`
- `ebit` / `ebitda`

Nota importante:

- La apertura interna de OPEX en el bridge sigue siendo aproximada si el backend no trae desglose completo. En la tabla mensual sí se priorizan campos reales cuando están disponibles.

## Tab: Evolução Temporal

La pestaña `Evolução temporal` responde a la pregunta: "¿Cómo evolucionó la tienda en los últimos meses?".

### Tabla Evolução Mensal — P&L

Utilidad:

- Compara mes a mes las principales líneas del P&L.
- Permite ver si una mejora o caída es puntual o tendencia.
- Mantiene destacada la última columna disponible.

API usada:

- `GET /bi_dwh/v1/dre/`
- Rango: ventana de 6 meses calculada desde el periodo seleccionado.
- Siempre con `period=monthly`.

Campos usados:

| Línea | Campos BI |
| --- | --- |
| Receita bruta | `gross_revenue_pre_disc` |
| Clases dentro de receita bruta | `by-class group_by=classe`, `metrics.gross_revenue_pre_disc` |
| Deducciones | `total_deducoes` |
| Descuentos | `discount_amount` |
| Devoluciones | `returns_amount` |
| Impuestos | `taxes` |
| Receita líquida | `net_revenue` |
| COGS | `cogs` |
| Lucro bruto | `gross_profit` o `net_revenue + cogs` |
| Margem bruta % | `gross_margin_pct` |
| Despesas operacionais | `total_opex` |
| Marketing | `marketing` |
| Royalties | `royalties` |
| Taxas de pagamento | `payment_fees` |
| EBITDA/EBIT | `ebitda` o fallback a `ebit` |
| Margem EBITDA % | `ebitda/net_revenue` o `ebit/net_revenue` |

Qué se hizo:

- Se amplió la tabla: antes solo mostraba poucas líneas (`Receita líquida`, `COGS`, `Lucro bruto`, `OPEX`, `EBITDA`).
- Ahora se agregan receita bruta, clases, deducciones, margen bruta %, OPEX con hijos reales y margen EBITDA %.
- Se corrigió la alineación de columnas usando anchos consistentes entre `thead` y `tbody`.

### Gráficos de Evolución

Bloque: `DreEvolutionChartsGrid`

Utilidad:

- Resume visualmente tendencias de receita, EBITDA, márgenes, OPEX y mix.
- Sirve para detectar estacionalidad y cambios de composición.

Campos usados:

- `net_revenue`
- `ebit` / `ebitda`
- `gross_margin_pct`
- `net_margin_pct`
- `total_opex`
- `by-class group_by=classe` para mix de receita por clase

Notas:

- El mix agrupa clases en buckets como `grau`, `solar`, `lc`, `acessorios`.
- Si la API no trae una serie con datos suficientes, el bloque se oculta o muestra estado de no disponible.

## Tab: Markup & descontos

La pestaña `Markup & descontos` responde a la pregunta: "¿Qué está presionando o explicando el markup efectivo?".

Esta pestaña es la que más se ajustó para evitar mocks. El diseño ideal tenía conceptos como `Markup teórico`, `Gap de erosão`, `desconto manual vs sistema`, `campanhas neutras` y `vendedor`. Esos campos todavía no llegan en el contrato actual, por lo que se implementaron equivalentes basados solamente en datos observables del BI.

### Barra Superior BI DWH

Bloque de contexto que muestra:

- Fuente: `BI DWH`
- Tienda y periodo
- Receita líquida
- Descuento
- Markup efectivo

Utilidad:

- Da contexto inmediato del periodo mostrado en el tab.
- Confirma que los datos vienen del backend real.

Campos usados:

- `store_name`
- `period`
- `net_revenue`
- `pct_desconto_bruta`
- markup efectivo ponderado desde `by-class`

### Cards de Markup y Descuento

Cards actuales:

- `Markup efetivo`
- `Pressão de desconto`
- `Impacto dos descontos`
- `Margem bruta`

Utilidad:

- Resume el estado de markup y descuentos con métricas reales.
- Reemplaza temporalmente los cards ideales de `Markup teórico`, `Gap de erosão` y `Erosão real` hasta que el backend exponga esos campos.

Campos usados:

| Card | Campos BI |
| --- | --- |
| Markup efetivo | `by-class metrics.markup_x`, ponderado por `metrics.net_revenue` |
| Pressão de desconto | `pct_desconto_bruta.actual` |
| Impacto dos descontos | `discount_amount.actual` |
| Margem bruta | `gross_margin_pct.actual` |

Qué no se pinta todavía:

- `Markup Teórico (c/ alívio)`
- `Gap de Erosão`
- `Erosão Real de Markup`

Motivo:

- No hay campos `markup_teorico`, `markup_catalog`, `markup_alivio`, `erosao`, `manual`, `sistema` ni `campanhas` en el contrato actual.

### Evolução do Markup

Utilidad:

- Muestra la evolución mensual del markup efectivo.
- Permite ver si el markup está mejorando o deteriorándose en la serie disponible.

API usada:

- `GET /bi_dwh/v1/dre/by-class/?group_by=classe`
- Rango de 6 meses.
- `period=monthly`.

Campos usados:

- `metrics.markup_x`
- `metrics.net_revenue`
- `period`

Cálculo:

- Por cada mes, se calcula markup efectivo ponderado por receita:

```text
markup_ponderado_mes = sum(markup_x_classe * receita_classe) / sum(receita_classe)
```

Botones:

- `Mensal (6m)`: disponible, porque la API actual trae serie mensual.
- `Diário (30d)`: visible pero deshabilitado.
- `Semanal (12s)`: visible pero deshabilitado.

Motivo:

- El contrato actual no trae series diarias ni semanales para `markup_x`.

Línea gris:

- La línea gris del diseño representa `Markup Teórico`.
- No se pinta hoy porque ese dato no viene.
- El componente ya está preparado para mostrarla automáticamente si llega `teorico`.

### Descontos no Tempo

Bloque actual: `Descontos no Tempo — Total BI`

Utilidad:

- Muestra la evolución mensual del valor total concedido en descuentos.
- Sustituye el bloque ideal `Sistema vs Manual` sin inventar esa separación.

API usada:

- `GET /bi_dwh/v1/dre/` en ventana mensual de 6 meses.

Campos usados:

- `discount_amount.actual`
- `period`

Qué no se pinta:

- `Sistema (promos LIVO)`
- `Manual (franqueado)`

Motivo:

- El contrato no separa descuentos manuales de descuentos de sistema.

### Drivers Observáveis de Markup

Utilidad:

- Identifica señales que pueden explicar presión de markup usando solo campos disponibles.
- Es un diagnóstico, no una atribución causal completa.

Cards actuales:

| Card | Qué significa | Campos usados |
| --- | --- | --- |
| Pressão de desconto | Qué tan fuerte es el descuento sobre la receita | `discount_amount`, `net_revenue` |
| Mix categoria | Qué clase concentra más receita y con qué markup | `revenue_share`, `markup_x`, `classe` |
| Markup por classe | Markup ponderado de loja vs promedio simple de clases | `markup_x`, `net_revenue` |
| Preço vs custo médio | Relación entre precio y costo medio por clase | `avg_price`, `avg_cost`, `gross_margin_pct` |

Qué se hizo:

- Se reemplazaron drivers ideales como `Desc. manuais`, `Mix marca/lentes` y `Campanhas sistema` por drivers observables.
- El texto del bloque aclara que `manual/sistema/campanhas` entran cuando backend exponga esos cortes.

### Markup por Categoria

Utilidad:

- Permite ver qué categorías tienen mayor o menor markup efectivo.
- Ayuda a priorizar revisión de precio, costo y mix.

API usada:

- `GET /bi_dwh/v1/dre/by-class/`
- Preferentemente `group_by=cogs_classe`, y también soporta `classe`.

Campos usados:

- `classe` o `cogs_classe`
- `metrics.markup_x`
- `metrics.net_revenue`
- `metrics.revenue_share`
- `metrics.gross_margin_pct`

Columnas actuales:

- `Categoria`
- `Markup`
- `Receita`
- `Share`
- `Margem`

Qué se corrigió:

- Antes la tabla mostraba columnas `Teórico`, `Gap` y `Erosão`, pero esos campos no existían.
- Ahora la tabla es adaptativa:
  - Si en el futuro llegan `markup_teorico`, `gap` y `erosao`, puede volver a mostrar esas columnas.
  - Con la data actual, muestra solo columnas reales del BI.

### Descontos Manuais por Vendedor

Estado actual: no se muestra.

Motivo:

- El contrato actual no trae vendedor, ventas por vendedor, descuento manual por vendedor ni variación por vendedor.

El componente está preparado:

- Si en el futuro llega `descontosManuaisPorVendedor`, `DreMarkupCategorySellerGrid` renderiza dos columnas en desktop:
  - izquierda: `Markup por Categoria`
  - derecha: `Descontos Manuais por Vendedor`

Datos necesarios para activarlo:

- `seller_id`
- `seller_name`
- `sales_count`
- `manual_discount_amount`
- `manual_discount_pct`
- `trend_pct`
- periodo anterior para comparación

## Tab: Plano de ação

La pestaña `Plano de ação` responde a la pregunta: "¿Qué acciones operativas conviene tomar según las señales disponibles del BI?".

No es un simulador ni una proyección financiera. Es un diagnóstico accionable con reglas simples, trazables y basadas en campos reales.

### Bloque Superior de Diagnóstico

Utilidad:

- Explica que el plan se genera desde señales disponibles del BI DWH.
- Aclara que no incluye proyección financiera porque faltan coeficientes de impacto.

Campos usados para contexto:

- `store_name`
- periodo seleccionado
- `net_margin_pct`
- markup efectivo ponderado
- `pct_desconto_bruta`
- `gross_margin_pct`

### Resumen de Indicadores

Muestra:

- Margem actual
- Markup actual
- Descuento
- Margem bruta

Campos usados:

- `net_margin_pct` o `contribution_margin_pct`
- `markup_x` ponderado por clase
- `pct_desconto_bruta`
- `gross_margin_pct`

### Cards de Acción

Cada acción incluye:

- prioridad
- título
- señal BI
- recomendación
- responsable
- plazo
- impacto cualitativo
- evidencia / fuente de datos

Reglas actuales:

| Acción | Condición | Campos usados |
| --- | --- | --- |
| Revisar presión de descuentos | `pct_desconto_bruta >= 15%` | `pct_desconto_bruta`, `discount_amount` |
| Atacar categoría con markup bajo | categoría con `markup_x` bajo y share relevante | `markup_x`, `revenue_share`, `classe` |
| Rebalancear mix | clase dominante diferente a clase de mayor markup | `revenue_share`, `markup_x` |
| Revisar COGS y margen bruta | `gross_margin_pct < 65%` | `gross_margin_pct`, `cogs` |
| Monitorar OPEX | `total_opex / net_revenue > 10%` | `total_opex`, `net_revenue` |

Qué no se implementa todavía:

- EBITDA potencial
- Ganancia mensual en R$
- Markup proyectado
- Simulador
- Impactos por acción

Motivo:

- El backend no trae coeficientes como `impact_markup_per_point`, `impact_ebitda`, `flow_through`, metas de red o cortes manual/sistema.

## Campos Faltantes Para Llegar al Diseño Ideal

Para replicar el diseño completo sin inventar datos, el backend debería exponer:

### Markup teórico y erosión

- `markup_teorico`
- `markup_teorico_alivio`
- `markup_catalog`
- `gap_erosao`
- `erosao_real_markup`
- desglose de erosión por `manual`, `mix`, `sistema`

### Descuentos

- `discount_manual_amount`
- `discount_system_amount`
- `manual_discount_pct`
- separación por vendedor
- separación por campaña

### Vendedores

- `seller_id`
- `seller_name`
- `sales_count`
- `manual_discount_amount`
- `manual_discount_trend_pct`

### Simulador / plan prescriptivo

- palancas disponibles
- rango mínimo/máximo/default de cada palanca
- coeficientes de impacto en receita, EBITDA y markup
- metas de red / benchmark
- flow-through de margen recuperada

## Resumen de Decisiones Técnicas

- Se eliminó el mock completo de DRE Lab.
- Se removieron flags `VITE_LAB_DRE_USE_MOCK` y `VITE_LAB_DRE_FETCH_LEGACY_AI_BLOCKS`.
- Se dejó de llamar la ruta legacy `/dre/lab/ai-blocks/`.
- Los tabs no disparan requests distintos; solo cambian la visualización del bundle ya cargado.
- Cambiar tienda o periodo sí dispara consulta nueva.
- `MTD` usa `period=daily`; si BI responde `data: []`, se muestra estado vacío y no se renderizan ceros.
- La UI evita inventar campos ausentes; usa `—`, oculta bloques o cambia la lectura a una versión honesta basada en BI.

