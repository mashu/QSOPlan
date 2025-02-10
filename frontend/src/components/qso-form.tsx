'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { MODULATIONS, BANDS, type Band, type Modulation, type QSOFormData } from '@/lib/constants';
import { APIError } from '@/lib/types';
import GridMapSelector from './grid-map';
import { Dialog } from './ui/dialog';

interface Props {
  onSuccess: () => void;
}

interface CallSignSuggestion {
  call_sign: string;
  default_grid_square?: string;
}

export default function QSOForm({ onSuccess }: Props) {
  const { token, user } = useAuthStore();
  const [formData, setFormData] = useState<QSOFormData>({
    initiator_call_sign: '',
    recipient: '',
    frequency: BANDS.CB[0].frequency,
    mode: 'SSB',
    datetime: new Date().toISOString().slice(0, 16),
    initiator_location: '',
    recipient_location: '',
  });

  const [selectedBand, setSelectedBand] = useState<Band>('CB');
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [error, setError] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [currentLocationField, setCurrentLocationField] = useState<'initiator' | 'recipient' | null>(null);
  const [suggestions, setSuggestions] = useState<CallSignSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (user?.call_sign) {
      setFormData(prev => ({
        ...prev,
        initiator_call_sign: user.call_sign,
        initiator_location: user.default_grid_square || prev.initiator_location
      }));
    }
  }, [user]);

  const fetchCallSignSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await api.get<CallSignSuggestion[]>(`/api/users/callsigns/?search=${input}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch call sign suggestions:', error);
    }
  };

  const handleBandChange = (band: Band) => {
    setSelectedBand(band);
    setSelectedChannel(1);
    const newFrequency = BANDS[band][0].frequency;
    setFormData(prev => ({ ...prev, frequency: newFrequency }));
  };

  const handleChannelChange = (channel: number) => {
    setSelectedChannel(channel);
    const channelData = BANDS[selectedBand].find(ch => ch.channel === channel);
    if (channelData) {
      setFormData(prev => ({ ...prev, frequency: channelData.frequency }));
    }
  };

  const handleLocationSelect = (gridSquare: string) => {
    if (currentLocationField === 'initiator') {
      setFormData(prev => ({ ...prev, initiator_location: gridSquare }));
    } else if (currentLocationField === 'recipient') {
      setFormData(prev => ({ ...prev, recipient_location: gridSquare }));
    }
    setMapOpen(false);
  };

  const openMap = (field: 'initiator' | 'recipient') => {
    setCurrentLocationField(field);
    setMapOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await api.post('/api/qsos/', {
        ...formData,
        datetime: new Date(formData.datetime).toISOString(),
        recipient: formData.recipient.toUpperCase(),
        initiator_location: formData.initiator_location.toUpperCase(),
        recipient_location: formData.recipient_location.toUpperCase()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form fields except for initiator data
      setFormData(prev => ({
        ...prev,
        recipient: '',
        recipient_location: '',
        datetime: new Date().toISOString().slice(0, 16),
      }));

      onSuccess();
    } catch (error) {
      const apiError = error as APIError;
      setError(
        apiError.response?.data?.detail || 
        Object.values(apiError.response?.data || {}).join(', ') || 
        'Failed to log contact'
      );
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/10 p-6 rounded-lg backdrop-blur-lg">
        <h2 className="text-xl font-bold text-white mb-4">Log New Contact</h2>
        
        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {/* Input fields */}
          <input
            type="text"
            value={formData.initiator_call_sign}
            disabled
            className="p-2 rounded bg-white/5 border border-white/20 text-white opacity-75 cursor-not-allowed"
            title="Your call sign (set in profile)"
          />

          <div className="relative">
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData({ ...formData, recipient: value });
                fetchCallSignSuggestions(value);
              }}
              onFocus={() => {
                if (formData.recipient) {
                  fetchCallSignSuggestions(formData.recipient);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Recipient Call Sign"
              className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
              required
              maxLength={10}
              pattern="[A-Z0-9]{3,10}"
              title="Call sign must be 3-10 alphanumeric characters"
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.call_sign}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-700 text-white"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        recipient: suggestion.call_sign,
                        recipient_location: suggestion.default_grid_square || prev.recipient_location
                      }));
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion.call_sign}
                    {suggestion.default_grid_square && 
                      <span className="text-gray-400 ml-2">({suggestion.default_grid_square})</span>
                    }
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Band and Channel Selection */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedBand}
              onChange={(e) => handleBandChange(e.target.value as Band)}
              className="p-2 rounded bg-white/5 border border-white/20 text-white"
            >
              {Object.keys(BANDS).map((band) => (
                <option key={band} value={band}>{band}</option>
              ))}
            </select>
            
            <select
              value={selectedChannel}
              onChange={(e) => handleChannelChange(Number(e.target.value))}
              className="p-2 rounded bg-white/5 border border-white/20 text-white"
            >
              {BANDS[selectedBand].map(({ channel }) => (
                <option key={channel} value={channel}>
                  Channel {channel}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selection */}
          <select
            value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value as Modulation })}
            className="p-2 rounded bg-white/5 border border-white/20 text-white"
          >
            {MODULATIONS.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>

          {/* Date and Time */}
          <input
            type="datetime-local"
            value={formData.datetime}
            onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
            className="p-2 rounded bg-white/5 border border-white/20 text-white"
            required
          />

          {/* Location Fields */}
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              value={formData.initiator_location}
              onChange={(e) => setFormData({ ...formData, initiator_location: e.target.value.toUpperCase() })}
              placeholder="Your Grid Square"
              className="col-span-3 p-2 rounded bg-white/5 border border-white/20 text-white"
              required
              maxLength={6}
              pattern="[A-Z0-9]{6}"
              title="Grid square must be exactly 6 characters"
            />
            <button
              type="button"
              onClick={() => openMap('initiator')}
              className="p-2 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
            >
              Map
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              value={formData.recipient_location}
              onChange={(e) => setFormData({ ...formData, recipient_location: e.target.value.toUpperCase() })}
              placeholder="Recipient Grid Square"
              className="col-span-3 p-2 rounded bg-white/5 border border-white/20 text-white"
              required
              maxLength={6}
              pattern="[A-Z0-9]{6}"
              title="Grid square must be exactly 6 characters"
            />
            <button
              type="button"
              onClick={() => openMap('recipient')}
              className="p-2 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
            >
              Map
            </button>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-300">
          Current frequency: {formData.frequency} MHz (Channel {selectedChannel})
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Log Contact
        </button>
      </form>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Select {currentLocationField === 'initiator' ? 'Your' : 'Recipient\'s'} Location
            </h3>
            <GridMapSelector onLocationSelect={handleLocationSelect} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setMapOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
