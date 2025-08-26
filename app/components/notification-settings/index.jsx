import React, { useState, useEffect } from 'react';
import { Label, Input } from 'reactstrap'; // Assuming you're using Reactstrap
import { useAppSelector } from '../../store';
import { authState } from '../auth/auth.slice';
import { updateNotificationSettings } from '../../common/common.api';

const NotificationSettings = () => {
    const { userInfo } = useAppSelector(authState);

    // Step 1: Create state to hold the notification settings
    const [notifications, setNotifications] = useState({
        promotional: { email: true, sms: true },
        transactional: { email: true, sms: true },
    });

    useEffect(() => {
        if (userInfo) {
            setNotifications(userInfo.notifications)
        }
    }, [userInfo]);

    // Step 2: Handle checkbox toggle
    const handleNotificationChange = async (category, channel, value) => {
        try {
            let updatedNotifications = { ...notifications };

            updatedNotifications[category] = {
                ...updatedNotifications[category],
                [channel]: value,
            };

            await updateNotificationSettings({ notifications: updatedNotifications });

            setNotifications(updatedNotifications);
        } catch (error) {
             
        }
    };

    // Step 4: Display UI
    return (
        <div className="card-body">
            {/* Display only promotional notifications */}
            {notifications && Object.keys(notifications).map((category) => {
                if (category !== "transactional") {
                    return (
                        <div className="media" key={category}>
                            <div className="media-body">
                                <h5>{category === "sms" ? category.toUpperCase() : category.charAt(0).toUpperCase() + category.slice(1)} Notifications</h5>
                                {Object.keys(notifications[category]).map((channel) => (
                                    <div key={channel} className="media">
                                        <div className="media-body">
                                            <span>{channel === "sms" ? channel.toUpperCase() : channel.charAt(0).toUpperCase() + channel.slice(1)}</span>
                                        </div>
                                        <div className="media-right">
                                            <Label className="switch">
                                                <Input
                                                    type="checkbox"
                                                    checked={notifications[category][channel]}
                                                    onChange={() =>
                                                        handleNotificationChange(
                                                            category,
                                                            channel,
                                                            !notifications[category][channel]
                                                        )
                                                    }
                                                />
                                                <span className="switch-state" />
                                            </Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
                return null;
            })}
            <p>
                <b>Note : </b>Enable or disable to control the type of notifications
                you will receive.
            </p>
        </div>
    );
};

export default NotificationSettings;
