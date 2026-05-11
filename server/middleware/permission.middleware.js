const checkPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    /*
    -------------------------------------------------------------------------
    ADMIN BYPASS
    -------------------------------------------------------------------------
    */

    if (req.user.role === 'admin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    next();
  };
};

module.exports = checkPermissions;
