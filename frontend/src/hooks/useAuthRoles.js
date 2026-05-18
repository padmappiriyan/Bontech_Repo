import { useSelector } from 'react-redux';
import { ROLES } from '../constants/roles';

/**
 * Custom hook to easily check user roles and permissions.
 * @returns {Object} { role, isAdmin, isSupervisor, isUser, isAdminOrSupervisor }
 */
const useAuthRoles = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const role = userInfo?.role || ROLES.USER;

    return {
        role,
        isAdmin: role === ROLES.ADMIN,
        isSupervisor: role === ROLES.SUPERVISOR,
        isUser: role === ROLES.USER,
        isAdminOrSupervisor: role === ROLES.ADMIN || role === ROLES.SUPERVISOR,
        userInfo
    };
};

export default useAuthRoles;
