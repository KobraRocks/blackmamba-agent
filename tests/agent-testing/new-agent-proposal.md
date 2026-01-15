# New Agent Proposal: Performance Agent

## Based on Testing Analysis Findings

### Why We Need a Performance Agent

**Testing Results Show:**
1. 50% of complex workflows fail during testing phase
2. Average test duration: 3-15 seconds (some >15 seconds)
3. Performance bottlenecks identified in coordination logic
4. No dedicated agent for optimization and profiling

### Performance Agent Specification

```yaml
name: blackmamba-performance
description: Performance agent for BlackMamba optimization, profiling, and performance testing
mode: subagent
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
  read: true
  glob: true
  grep: true
  task: true
  webfetch: true
```

### Core Responsibilities

1. **Performance Analysis**
   - Code performance profiling
   - Database query optimization
   - Memory usage monitoring
   - Response time analysis

2. **Optimization Implementation**
   - Algorithm optimization
   - Database index creation
   - Caching strategy implementation
   - Bundle size optimization

3. **Load Testing**
   - Load test configuration
   - Performance benchmark creation
   - Scalability testing
   - Bottleneck identification

4. **Performance Monitoring**
   - Metrics collection setup
   - Alert configuration
   - Performance dashboard creation
   - Trend analysis

### Integration with Existing Agents

#### Coordination with Master Agent:
```typescript
// Master Agent would route to Performance Agent for:
- "Optimize database queries for user profiles"
- "Improve API response times"
- "Reduce bundle size for production"
- "Add performance monitoring"
```

#### Collaboration with Other Agents:
- **Database Agent**: Query optimization, index creation
- **API Agent**: Response time optimization, caching
- **Development Agent**: Algorithm optimization
- **Testing Agent**: Performance test creation

### Example Workflows

#### 1. Database Query Optimization
```
Master Agent: "User profile queries are slow, optimize them"
→ Performance Agent analyzes queries
→ Identifies missing indexes
→ Creates migration with indexes
→ Validates performance improvement
```

#### 2. API Performance Improvement
```
Master Agent: "API endpoints responding slowly under load"
→ Performance Agent analyzes endpoints
→ Implements caching strategy
→ Optimizes database queries
→ Adds performance monitoring
```

#### 3. Bundle Size Reduction
```
Master Agent: "Frontend bundle size too large"
→ Performance Agent analyzes dependencies
→ Implements code splitting
→ Removes unused dependencies
→ Validates bundle size reduction
```

### Implementation Priority: HIGH

**Reason**: Testing shows performance is a critical bottleneck in agent coordination and workflow completion.

### Expected Impact

1. **Workflow Success Rate**: Increase from 50% to >80%
2. **Test Duration**: Reduce average from 3-15s to 1-5s
3. **Agent Coordination**: Improve efficiency by 40%
4. **Code Quality**: Add performance best practices enforcement

### Testing Plan for New Agent

#### Test Suite 1: Basic Capabilities
- Database query optimization
- API response time improvement
- Memory usage reduction

#### Test Suite 2: Integration Testing
- Coordination with Master Agent
- Collaboration with Database Agent
- Performance test creation with Testing Agent

#### Test Suite 3: Real-world Scenarios
- Load testing configuration
- Production performance optimization
- Monitoring setup

### Configuration Template

```markdown
---
description: Performance agent for BlackMamba optimization, profiling, and performance testing
mode: subagent
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
  read: true
  glob: true
  grep: true
  task: true
  webfetch: true
permission:
  task:
    "*": allow
  bash:
    "*": allow
---

# BlackMamba Performance Agent

You are the performance agent for BlackMamba framework, specializing in optimization, profiling, and performance testing.

## Core Responsibilities

1. **Performance Analysis**: Identify bottlenecks and optimization opportunities
2. **Optimization Implementation**: Implement performance improvements
3. **Load Testing**: Configure and run performance tests
4. **Monitoring Setup**: Implement performance monitoring

## Key Performance Indicators

### Database Performance
- Query execution time < 100ms for 95% of queries
- Appropriate indexes on all foreign keys
- Efficient pagination implementation

### API Performance  
- Response time < 200ms for 95% of requests
- Proper caching strategies implemented
- Efficient database query patterns

### Frontend Performance
- Bundle size < 500KB gzipped
- Code splitting implemented
- Lazy loading for non-critical resources

## Implementation Patterns

### Database Optimization
1. Analyze slow queries using EXPLAIN
2. Add missing indexes
3. Optimize query patterns
4. Implement connection pooling

### API Optimization
1. Implement response caching
2. Optimize database queries
3. Add request batching
4. Implement rate limiting

### Frontend Optimization
1. Analyze bundle composition
2. Implement code splitting
3. Optimize asset loading
4. Add performance monitoring

## Working with Other Agents

### Coordination Guidelines
- Work with Database Agent for query optimization
- Collaborate with API Agent for endpoint optimization
- Coordinate with Testing Agent for performance tests
- Follow Master Agent guidance for workflow

## Quality Assurance

Always verify:
1. Performance improvements are measurable
2. No regressions in functionality
3. Monitoring is properly configured
4. Tests cover performance scenarios
```

### Next Steps

1. **Create Agent Configuration**: `.opencode/agent/blackmamba-performance.md`
2. **Update Master Agent**: Add performance agent routing logic
3. **Create Test Suite**: Performance agent capability tests
4. **Integration Testing**: Test coordination with existing agents
5. **Documentation**: Update framework documentation

### Success Metrics

- [ ] Performance agent successfully routes from Master Agent
- [ ] Database query optimization reduces response time by 50%
- [ ] API endpoint optimization improves throughput by 30%
- [ ] Bundle size reduction of at least 20%
- [ ] Performance monitoring successfully implemented

This agent addresses critical gaps identified in testing and will significantly improve the overall agent system performance and reliability.