/* eslint-env vitest/globals */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Card from './Card';

describe('Card', () => {
  const mockCard = {
    id: '1',
    name: 'Test Card',
    details: 'This is a test card.',
    imageUrl: 'https://via.placeholder.com/150',
  };

  it('renders card with correct name and details', () => {
    render(
      <MemoryRouter>
        <Card card={mockCard} />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('This is a test card.')).toBeInTheDocument();
  });
});
