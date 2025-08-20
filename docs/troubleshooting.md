## Troubleshooting e Debugging

### Problemas Comuns

#### 1. Hooks de Dados Não Funcionam
- Verificar se `AuthContext` está fornecendo `user` válido
- Confirmar que as regras do Firestore permitem acesso
- Check se `useFirestoreQuery` está recebendo `collection` e `constraints` corretos

#### 2. Recorrências Não Calculam
- Validar formato de data em `utils/recurrence.js` (deve ser ISO)
- Verificar se `startDate` não é posterior a `endDate`
- Confirmar que `frequency` e `interval` são válidos

#### 3. Componentes Não Re-renderizam
- Verificar se estado local está sendo atualizado corretamente
- Confirmar que hooks de dados estão retornando dados atualizados
- Check se `useEffect` dependencies estão corretas

#### 4. Problemas de Autenticação
- Verificar se Firebase está configurado corretamente
- Confirmar que `AuthContext` está envolvendo a aplicação
- Check se regras de segurança do Firestore estão corretas

### Debugging

#### Logs Úteis
```javascript
// Em hooks de dados
console.log('Firestore query:', collection, constraints);
console.log('Query result:', data);

// Em componentes
console.log('Component state:', state);
console.log('Component props:', props);
```

#### Verificações Rápidas
- Dados chegando do Firestore? (check Network tab)
- Estado local atualizado? (React DevTools)
- Props sendo passadas corretamente?
- Hooks executando na ordem esperada?

### Recursos de Debug
- React DevTools para estado e props
- Firebase Console para dados e regras
- Network tab para requisições
- Console para logs e erros
