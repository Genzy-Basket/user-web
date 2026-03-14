import { createContext, useContext, useState, useEffect, useMemo } from "react";
import apiClient from "../../../api/api.client";

// Fallback values — used while fetching or if the request fails
const DEFAULTS = {
  deliveryCharge: 40,
  freeDeliveryThreshold: 500,
  orderCutoffHour: 23,
  orderCutoffMinute: 0,
  deliveryByHour: 7,
  deliveryByMinute: 30,
  contactPhone: "",
  contactEmail: "",
};

const DeliveryConfigContext = createContext(DEFAULTS);

export const DeliveryConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULTS);

  useEffect(() => {
    apiClient
      .get("/settings")
      .then((res) => {
        const data = res.data?.data ?? {};
        // Merge only keys present in the response, keep defaults for anything missing
        setConfig((prev) => ({
          ...prev,
          ...(data.deliveryCharge != null && { deliveryCharge: data.deliveryCharge }),
          ...(data.freeDeliveryThreshold != null && { freeDeliveryThreshold: data.freeDeliveryThreshold }),
          ...(data.orderCutoffHour != null && { orderCutoffHour: data.orderCutoffHour }),
          ...(data.orderCutoffMinute != null && { orderCutoffMinute: data.orderCutoffMinute }),
          ...(data.deliveryByHour != null && { deliveryByHour: data.deliveryByHour }),
          ...(data.deliveryByMinute != null && { deliveryByMinute: data.deliveryByMinute }),
          ...(data.contactPhone && { contactPhone: data.contactPhone }),
          ...(data.contactEmail && { contactEmail: data.contactEmail }),
        }));
      })
      .catch(() => {
        // Keep defaults silently — non-critical
      });
  }, []);

  const value = useMemo(() => config, [config]);

  return (
    <DeliveryConfigContext.Provider value={value}>
      {children}
    </DeliveryConfigContext.Provider>
  );
};

export const useDeliveryConfig = () => useContext(DeliveryConfigContext);
