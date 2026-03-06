export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireSuperAdmin(req, res, next) {
  return requireRole('super_admin')(req, res, next);
}

export function requireAdminOrSuperAdmin(req, res, next) {
  return requireRole('admin', 'super_admin')(req, res, next);
}

export function requireApprover(req, res, next) {
  return requireRole('approver', 'admin', 'super_admin')(req, res, next);
}

export function requireRequestor(req, res, next) {
  return requireRole('requestor', 'admin', 'super_admin')(req, res, next);
}

export function requireAuditor(req, res, next) {
  return requireRole('auditor', 'admin', 'super_admin')(req, res, next);
}
