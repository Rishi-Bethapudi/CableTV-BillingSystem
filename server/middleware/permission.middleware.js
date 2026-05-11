const checkPermissions =
  (...requiredPermissions) =>
  (req, res, next) => {
    try {
      /*
      =======================================================================
      AUTH VALIDATION
      =======================================================================
      */

      if (!req.user) {
        return res.status(401).json({
          message: 'Unauthorized.',
        });
      }

      /*
      =======================================================================
      ADMIN FULL ACCESS
      =======================================================================
      */

      if (req.user.role === 'admin') {
        return next();
      }

      /*
      =======================================================================
      OPERATOR FULL ACCESS
      =======================================================================
      */

      if (req.user.role === 'operator') {
        return next();
      }

      /*
      =======================================================================
      AGENT / SUPERVISOR RBAC
      =======================================================================
      */

      const userPermissions = req.user.permissions || [];

      /*
      =======================================================================
      CHECK IF USER HAS REQUIRED PERMISSION
      =======================================================================
      */

      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: 'Permission denied',
        });
      }

      next();
    } catch (error) {
      console.error('PERMISSION MIDDLEWARE ERROR:', error.message);

      return res.status(500).json({
        message: 'Permission validation failed',
      });
    }
  };

module.exports = checkPermissions;
