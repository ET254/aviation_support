# Operations Manual

## System Overview

The Kenya Aviation Weather Decision Support System (KAW-DSS) is a full-stack application for real-time weather analysis and aviation decision support. This manual covers operational tasks, monitoring, and incident response.

## Daily Operations

### Health Checks

Perform these checks at the start of each day:

```bash
# Backend health
curl https://api.example.com/health/live

# Database connectivity
curl https://api.example.com/health/ready

# Check system logs for errors
kubectl logs -f -l app=air-backend --tail=100
```

### Monitoring Dashboard

1. Access: https://monitoring.example.com
2. Key metrics to monitor:
   - API response time (target: <500ms)
   - Database query time (target: <100ms)
   - Error rate (target: <0.1%)
   - CPU usage (target: <70%)
   - Memory usage (target: <80%)

### User Support

Common issues and resolutions:

| Issue | Resolution |
|-------|-----------|
| "API unavailable" | Check backend health; restart if needed |
| Slow weather data load | Check database connections; review query logs |
| Dashboard not refreshing | Clear browser cache; check WebSocket connection |
| Authentication errors | Verify JWT token validity; check auth service logs |

## Incident Response

### Severity Levels

- **Critical**: System down, data loss risk
- **High**: Core features unavailable
- **Medium**: Degraded performance, non-core features down
- **Low**: Minor UI issues, documentation errors

### Response Procedures

#### Critical Incident

```bash
# 1. Page on-call team immediately
# 2. Assess impact
kubectl describe pod -l app=air-backend

# 3. Check recent deployments
kubectl rollout history deployment/air-backend

# 4. Rollback if needed
kubectl rollout undo deployment/air-backend

# 5. Scale down problematic service
kubectl scale deployment air-backend --replicas=1

# 6. Investigate root cause
kubectl logs -f -l app=air-backend --timestamps=true

# 7. Update incident tracking system
# 8. Post mortem within 24 hours
```

#### High Priority Incident

```bash
# 1. Alert relevant team
# 2. Increase logging verbosity
kubectl set env deployment/air-backend LOG_LEVEL=debug

# 3. Monitor closely
watch kubectl top pods -l app=air-backend

# 4. Apply fix or workaround
# 5. Document for post-incident review
```

## Maintenance Tasks

### Weekly

- Review error logs for patterns
- Check disk space availability
- Verify backup completion
- Update dependency security patches

```bash
# Check disk usage
kubectl exec -it <pod-name> -- df -h

# Review logs for errors
kubectl logs -l app=air-backend --since=7d | grep ERROR | wc -l

# Run security scan
npm audit
```

### Monthly

- Update documentation
- Rotate credentials and API keys
- Performance optimization review
- Capacity planning

```bash
# Update Node.js and dependencies
docker pull node:18-alpine
docker pull postgres:13

# Test in staging
docker-compose -f docker-compose.staging.yml up

# Performance testing
ab -n 1000 -c 10 https://api.example.com/api/stations
```

### Quarterly

- Major dependency updates
- Infrastructure review
- Disaster recovery drill
- Security audit

## Backups and Recovery

### Automated Backups

```bash
# Daily database backups
0 2 * * * pg_dump -h postgres.example.com -U airuser air_db > /backups/air_db_$(date +\%Y\%m\%d).sql

# S3 backup
aws s3 sync /backups s3://air-backups/
```

### Manual Backup

```bash
# Full database backup
pg_dump -h <host> -U airuser air_db -Fc > backup.dump

# Backup size check
du -sh backup.dump
```

### Recovery Procedures

#### Partial Data Recovery

```bash
# Restore specific table
pg_restore -d air_db -t weather_data backup.dump

# Restore with specific user
pg_restore -d air_db -U airuser backup.dump
```

#### Full Recovery

```bash
# 1. Stop application
kubectl scale deployment air-backend --replicas=0

# 2. Drop database
dropdb -U airuser air_db

# 3. Restore
createdb -U airuser air_db
pg_restore -d air_db -U airuser backup.dump

# 4. Verify integrity
psql -U airuser air_db -c "SELECT COUNT(*) FROM weather_data;"

# 5. Restart application
kubectl scale deployment air-backend --replicas=3
```

## Log Management

### Log Locations

```bash
# Kubernetes
kubectl logs <pod-name>
kubectl logs -l app=air-backend -f

# Docker Compose
docker-compose logs backend

# File-based (if configured)
/var/log/air/backend.log
/var/log/air/frontend.log
/var/log/air/database.log
```

### Log Analysis

```bash
# Find errors in past hour
kubectl logs -l app=air-backend --since=1h | grep ERROR

# Extract specific service logs
kubectl logs -l app=air-backend | grep "weather-service"

# Performance analysis
kubectl logs -l app=air-backend | grep "duration" | sort -t= -k2 -nr | head -10
```

### Log Retention

- Application logs: 30 days
- Error logs: 90 days
- Audit logs: 1 year
- Database logs: 7 days

Configure in logging service or syslog:

```
/var/log/air/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 app app
    sharedscripts
}
```

## Performance Tuning

### Database Performance

```sql
-- Check slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX idx_weather_timestamp ON weather_data(timestamp);
CREATE INDEX idx_alerts_status ON alerts(status, created_at);

-- Analyze query plans
EXPLAIN ANALYZE
SELECT * FROM weather_data
WHERE station_id = 'HKJK' AND timestamp > NOW() - INTERVAL '24 hours';
```

### Application Performance

```bash
# Monitor request duration
kubectl logs -l app=air-backend | grep "duration:" | awk '{print $NF}' | sort -n | tail -20

# Check memory leaks
kubectl top pod <pod-name> --containers

# Database connection pool stats
curl http://localhost:5000/metrics | grep pool
```

### Resource Optimization

```yaml
# Adjust resource requests/limits
resources:
  requests:
    cpu: 256m
    memory: 512Mi
  limits:
    cpu: 512m
    memory: 1Gi
```

## Scaling

### Horizontal Scaling (Add Replicas)

```bash
# Scale backend
kubectl scale deployment air-backend --replicas=5

# Check scaling progress
kubectl rollout status deployment/air-backend

# Monitor load
kubectl top pods -l app=air-backend
```

### Vertical Scaling (Increase Resources)

```yaml
# Update deployment resource limits
kubectl set resources deployment air-backend \
  --requests=cpu=500m,memory=1Gi \
  --limits=cpu=1,memory=2Gi
```

### Auto-scaling

```bash
# Enable horizontal pod autoscaling
kubectl autoscale deployment air-backend \
  --min=2 --max=10 \
  --cpu-percent=70

# Check HPA status
kubectl get hpa air-backend
```

## User Management

### Create Admin User

```bash
kubectl exec -it <backend-pod> -- npm run admin:create -- \
  --email admin@example.com \
  --password securepassword
```

### Reset User Password

```bash
# Via database
UPDATE users SET password_hash = ... WHERE email = 'user@example.com';

# Via API
curl -X POST https://api.example.com/admin/users/reset-password \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"email":"user@example.com"}'
```

### Audit User Activity

```bash
# Query audit log
SELECT user_id, action, resource, timestamp FROM audit_log
WHERE user_id = 'user-123' AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

## Disaster Recovery

### RTO/RPO Targets

- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 15 minutes

### Failover Procedures

#### Database Failover

```bash
# Promote read replica to primary
aws rds promote-read-replica --db-instance-identifier air-db-replica

# Update connection string
kubectl set env deployment/air-backend \
  DATABASE_URL=postgresql://user:pass@new-primary:5432/air_db

# Restart pods
kubectl rollout restart deployment/air-backend
```

#### Region Failover

```bash
# Activate standby region
# 1. Update DNS to point to standby
# 2. Verify application health
# 3. Redirect traffic
aws route53 change-resource-record-sets --hosted-zone-id <zone> \
  --change-batch file://failover.json
```

## Contact and Escalation

### Escalation Path

1. **Level 1**: On-call engineer
2. **Level 2**: Senior engineer
3. **Level 3**: Engineering lead
4. **Level 4**: VP of Operations

### Emergency Contacts

- **Operations**: ops@example.com, +254-XXX-XXXX
- **Database**: dba@example.com
- **Security**: security@example.com

### Status Page

- User-facing incidents: https://status.example.com
- Update template: "Service X is experiencing Y. ETA for resolution: Z"

## Compliance and Auditing

### Data Retention

- Transaction logs: 2 years
- User activity: 90 days
- System logs: 30 days
- Backups: 1 year

### Compliance Checks

```bash
# Audit trail completeness
SELECT COUNT(*) FROM audit_log
WHERE timestamp > NOW() - INTERVAL '24 hours';

# Verify encryption at rest
aws rds describe-db-instances --db-instance-identifier air-db \
  --query 'DBInstances[0].StorageEncrypted'

# Check access control policies
kubectl get rolebindings -A
```

## Documentation Updates

- Keep runbooks current with deployment changes
- Document new monitoring dashboards
- Update escalation procedures quarterly
- Record postmortem findings
