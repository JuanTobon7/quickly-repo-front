# Guía de Optimización de Renderizado en React

## 🎯 Problema Resuelto

La aplicación sufría de:
1. **Re-renderizados innecesarios** - Componentes como header y sidebar se re-renderizaban sin cambios
2. **Loop infinito en ProductTaxSection** - El componente causaba renders infinitos bloqueando la interfaz

## ✅ Soluciones Implementadas

### 1. **React.memo() - Memoización de Componentes**

Envuelve componentes que no necesitan re-renderizarse si sus props no cambian.

**Componentes optimizados:**
- `MainLayout` - Header y sidebar ahora solo se renderizan cuando cambian sus props
- `ProductEditForm` - Evita re-renders cuando cambia el estado del layout padre
- `ProductTaxSection` - **FIX CRÍTICO**: Eliminado loop infinito + memoización

**⚠️ IMPORTANTE**: `ProductTaxSection` tenía un loop infinito que causaba que la app se congelara. Ver `LOOP_FIX.md` para detalles del fix.

```tsx
// ❌ Antes
export default MainLayout;

// ✅ Después
import { memo } from 'react';
export default memo(MainLayout);
```

### 2. **useCallback() - Callbacks Estables**

Memoiza funciones que se pasan como props para evitar que se recreen en cada render.

**Callbacks optimizados:**
- `handleLogout` en MainLayout
- `handleTabChange` en InventoryPage
- `goBack` en InventoryPage
- `handleTaxDataChange` en ProductEditForm

```tsx
// ❌ Antes - Se crea una nueva función en cada render
const handleLogout = () => {
  logout();
  navigate('/login');
};

// ✅ Después - La función se mantiene estable
const handleLogout = useCallback(() => {
  logout();
  navigate('/login');
}, [navigate]);
```

### 3. **useMemo() - Cálculos Costosos**

Ya estabas usando `useMemo` correctamente para las columnas de la tabla.

```tsx
const columns = useMemo<ColumnDef<ProductSummary>[]>(
  () => [/* ... */],
  [] // Solo se calcula una vez
);
```

## 📊 Beneficios

| Antes | Después |
|-------|---------|
| Header y sidebar se re-renderizaban con cada cambio de estado | Solo se renderizan cuando cambian sus props |
| ProductEditForm se re-renderizaba al cambiar tabs | Solo se re-renderiza cuando cambian sus props reales |
| Callbacks se recreaban constantemente | Callbacks estables que React puede optimizar |

## 🚀 Patrones para Aplicar en Futuros Componentes

### Cuándo usar React.memo()

```tsx
// ✅ Úsalo en:
// - Componentes de layout (header, sidebar, footer)
// - Componentes que reciben props complejas pero no cambian frecuentemente
// - Listas con muchos items
// - Componentes con renderizado costoso

const MyComponent = memo(({ data }) => {
  return <div>{/* Contenido */}</div>;
});
```

### Cuándo usar useCallback()

```tsx
// ✅ Úsalo en:
// - Callbacks que se pasan a componentes memoizados
// - Event handlers que se pasan a componentes hijo
// - Funciones que son dependencias de useEffect

const handleClick = useCallback(() => {
  // Lógica del click
}, [dependencies]);
```

### Cuándo usar useMemo()

```tsx
// ✅ Úsalo en:
// - Cálculos costosos (filtros, ordenamientos, transformaciones)
// - Objetos o arrays que se pasan como props
// - Columnas de tablas

const filteredData = useMemo(
  () => data.filter(item => item.active),
  [data]
);
```

## ⚠️ Advertencias

### No abuses de la optimización

```tsx
// ❌ MAL - Optimización prematura
const SimpleText = memo(({ text }) => <p>{text}</p>);

// ✅ BIEN - Los componentes simples no necesitan memo
const SimpleText = ({ text }) => <p>{text}</p>;
```

### Cuidado con las dependencias

```tsx
// ❌ MAL - Falta dependencia
const handleClick = useCallback(() => {
  console.log(userId); // userId no está en dependencias
}, []);

// ✅ BIEN - Todas las dependencias incluidas
const handleClick = useCallback(() => {
  console.log(userId);
}, [userId]);
```

## 🔍 Cómo Detectar Re-renders Innecesarios

### 1. React DevTools Profiler

```bash
# Instala React DevTools en tu navegador
# Luego en la pestaña "Profiler":
# 1. Haz clic en "Record"
# 2. Realiza acciones en tu app
# 3. Detén la grabación
# 4. Ve qué componentes se renderizaron y por qué
```

### 2. Console Logs Estratégicos

```tsx
const MyComponent = ({ data }) => {
  console.log('🔄 MyComponent renderizado');
  
  useEffect(() => {
    console.log('⚡ data cambió:', data);
  }, [data]);
  
  return <div>{/* ... */}</div>;
};
```

### 3. why-did-you-render (biblioteca)

```bash
npm install @welldone-software/why-did-you-render
```

## 📚 Checklist de Optimización

Antes de marcar un componente como optimizado, verifica:

- [ ] ¿El componente se renderiza frecuentemente sin cambios en props?
- [ ] ¿El componente tiene lógica o renderizado costoso?
- [ ] ¿Los callbacks se pasan a componentes memoizados?
- [ ] ¿Las dependencias de useCallback/useMemo están correctamente declaradas?
- [ ] ¿La optimización realmente mejora el rendimiento? (mide antes y después)

## 🎓 Recursos Adicionales

- [React Docs - memo](https://react.dev/reference/react/memo)
- [React Docs - useCallback](https://react.dev/reference/react/useCallback)
- [React Docs - useMemo](https://react.dev/reference/react/useMemo)
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)

## 🧪 Pruebas de Rendimiento

Para verificar que las optimizaciones funcionan:

```tsx
// En ProductEditForm.tsx, añade temporalmente:
useEffect(() => {
  console.log('🔄 ProductEditForm renderizado');
});

// En MainLayout.tsx:
useEffect(() => {
  console.log('🔄 MainLayout renderizado');
});
```

Luego:
1. Abre la consola del navegador
2. Edita campos en ProductEditForm
3. Observa que MainLayout NO se imprime (no se re-renderiza)
4. Cambia de tab
5. Observa que MainLayout SÍ se imprime (renderizado intencional)

---

**Fecha de implementación:** Noviembre 2025  
**Archivos optimizados:**
- `src/layout/MainLayout.tsx`
- `src/layout/ProductEditForm.tsx`
- `src/components/products/ProductTaxSection.tsx`
- `src/pages/InventoryPage.tsx`
