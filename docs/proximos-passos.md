## Prompt inicial

Quero criar alguns novos recursos no app. 

Criação de transações recorrentes.
Isso significa que ao marcar que essa transação é recorrente, será criada uma instância dela para todos os próximos meses, podemos trabalhar com 1 ano para frente, mas gostaria de um gatilho automático de criação dos próximos. Também devo poder editar as transações. Devo poder excluir as transações. Ao editar ou excluir, o sistema deve perguntar se quero realizar essa operação com apenas a instância selecionada, todas as instâncias da série ou apenas esta e as próximas, mantendo o passado intacto. Elabore um planejamento para a implementação dessa funcionalidade.

Criação de compras parceladas no cartão
Quero poder criar compras parceladas que serão adicionadas às faturas com indicação de qual parcela é. Ainda preciso de ajuda para refinar.

Criação de recorrência nos cartões de crédito, para assinaturas
Deve funcionar de forma semelhante à recorrência normal, mas entrando nas faturas.

Correções e melhorias gerais que possa identificar

Peço atenção às regras do ESlint.

Primeiro elabore um plano de implementação, com uma lista de atividades a serem realizadas. Depois vamos implementando uma a uma e testando.

## Resposta

Oportunidades de melhoria:

1. **Estrutura de dados**: Precisamos expandir o modelo de dados para suportar recorrência
2. **Componentes**: Alguns componentes podem ser otimizados
3. **Validações**: Adicionar mais validações de dados
4. **UX/UI**: Melhorar feedback visual para operações complexas

### Plano de Implementação

#### **FASE 1: Estrutura Base para Recorrência**

##### 1.1 Modelagem de Dados

- [x] Criar schema para transações recorrentes
- [x] Definir tipos de recorrência (mensal, anual, personalizada)
- [x] Criar campo `recurrenceId` nas transações para agrupá-las
- [x] Adicionar campos de metadados de recorrência

##### 1.2 Utilitários de Recorrência

- [x] Criar funções para cálculo de datas recorrentes
- [x] Implementar lógica de geração de instâncias futuras
- [x] Criar validadores para regras de recorrência

#### **FASE 2: Transações Recorrentes**

##### 2.1 Interface de Criação

- [x] Adicionar toggle "Transação Recorrente" nos formulários
- [x] Criar componente de configuração de recorrência
- [x] Implementar preview das próximas instâncias
- [x] Validações específicas para recorrência

##### 2.2 Lógica de Negócio

- [x] Implementar criação de série recorrente
- [ ] ~Sistema de geração automática (1 ano à frente)~
- [ ] ~Trigger para criação de novas instâncias~
- [x] Implementar edição de série recorrente

##### 2.3 Operações em Série

- [x] Modal de confirmação para edição/exclusão
- [x] Opções: "Apenas esta", "Esta e próximas", "Todas"
- [x] Implementar lógica de propagação de mudanças
- [ ] ~Histórico de alterações~

#### **FASE 3: Compras Parceladas**

##### 3.1 Interface de Parcelamento

- [x] Adicionar opção "Parcelar compra" no formulário de despesa
- [x] Componente de configuração de parcelas
- [x] Preview das parcelas nas faturas
- [ ] Validações de parcelamento

##### 3.2 Integração com Faturas

- [ ] Distribuição automática nas faturas futuras
- [ ] Identificação visual das parcelas
- [ ] Cálculo correto dos totais das faturas
- [ ] Gestão de alterações em parcelas

#### **FASE 4: Recorrência em Cartões (Assinaturas)**

##### 4.1 Assinaturas em Cartão

- [ ] Estender formulário de despesa para assinaturas
- [ ] Lógica específica para cartões de crédito
- [ ] Integração com sistema de faturas
- [ ] Gestão de ciclos de faturamento

##### 4.2 Operações Especiais

- [ ] Cancelamento de assinaturas
- [ ] Alteração de valores
- [ ] Mudança de cartão
- [ ] Histórico de assinaturas

#### **FASE 5: Melhorias e Correções**

##### 5.1 Correções de ESLint

- [ ] Corrigir warnings de dependências em useEffect
- [ ] Otimizar re-renders desnecessários
- [ ] Melhorar prop-types e validações
- [ ] Padronizar nomenclatura

##### 5.2 Melhorias de UX

- [ ] Loading states mais específicos
- [ ] Feedback visual para operações longas
- [ ] Tooltips explicativos
- [ ] Atalhos de teclado adicionais

##### 5.3 Performance

- [ ] Otimizar queries do Firestore
- [ ] Implementar paginação onde necessário
- [ ] Cache de dados calculados
- [ ] Lazy loading de componentes
