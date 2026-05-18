import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchActivePlatforms, 
    fetchAllPlatforms, 
    addNewPlatform, 
    modifyPlatform, 
    removePlatform,
    fetchGlobalRates,
    updateGlobalRate,
    syncGlobalRates,
    resetSettingsStatus
} from '../redux/features/settings/settingsSlice';

const useSettings = () => {
    const dispatch = useDispatch();
    const { 
        activePlatforms = [], 
        allPlatforms = [], 
        globalRates = [], 
        loading, 
        error, 
        success 
    } = useSelector((state) => state.settings || {});

    const loadActivePlatforms = useCallback(() => {
        dispatch(fetchActivePlatforms());
    }, [dispatch]);

    const loadAllPlatforms = useCallback(() => {
        dispatch(fetchAllPlatforms());
    }, [dispatch]);

    const createPlatform = useCallback((formData) => {
        dispatch(addNewPlatform(formData));
    }, [dispatch]);

    const updatePlatform = useCallback((id, formData) => {
        dispatch(modifyPlatform({ id, formData }));
    }, [dispatch]);

    const deletePlatform = useCallback((id) => {
        dispatch(removePlatform(id));
    }, [dispatch]);

    const loadRates = useCallback(() => {
        dispatch(fetchGlobalRates());
    }, [dispatch]);

    const upsertRate = useCallback((rateData) => {
        dispatch(updateGlobalRate(rateData));
    }, [dispatch]);

    const syncRates = useCallback(() => {
        dispatch(syncGlobalRates());
    }, [dispatch]);

    const resetStatus = useCallback(() => {
        dispatch(resetSettingsStatus());
    }, [dispatch]);

    return {
        // State
        activePlatforms,
        allPlatforms,
        globalRates,
        loading,
        error,
        success,
        // Actions
        loadActivePlatforms,
        loadAllPlatforms,
        createPlatform,
        updatePlatform,
        deletePlatform,
        loadRates,
        upsertRate,
        syncRates,
        resetStatus
    };
};

export default useSettings;
