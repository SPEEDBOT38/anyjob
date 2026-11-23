import React from 'react';
import {roleGroups, roles, locationGroups, remoteLocation, findLocation} from './data';

// Dropdowns only: nothing is typed, so the search always gets a value the backend understands.
export function RolePicker({value, onChange, label = 'Job role'}) {
  return <label>{label}
    <select value={value} onChange={e => onChange(e.target.value)}>
      {value && !roles.includes(value) && <option value={value}>{value}</option>}
      {roleGroups.map(([group, list]) => <optgroup key={group} label={group}>{list.map(r => <option key={r} value={r}>{r}</option>)}</optgroup>)}
    </select>
  </label>;
}

export function LocationPicker({value, onChange, label = 'Location'}) {
  return <label>{label}
    <select value={findLocation(value) ? value : ''} onChange={e => onChange(e.target.value)}>
      <option value="">Anywhere (all locations)</option>
      <option value={remoteLocation.id}>{remoteLocation.label}</option>
      {locationGroups.map(([country, list]) => <optgroup key={country} label={country}>{list.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</optgroup>)}
    </select>
  </label>;
}

export const locationQuery = id => (findLocation(id) || {}).query || '';
