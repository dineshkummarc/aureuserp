<?php

namespace Webkul\Product\Filament\Resources\ProductResource\Pages;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRelatedRecords;
use Filament\Tables;
use Filament\Tables\Table;
use Webkul\Product\Filament\Resources\ProductResource;

class ManageVariants extends ManageRelatedRecords
{
    protected static string $resource = ProductResource::class;

    protected static string $relationship = 'variants';

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    public static function getNavigationLabel(): string
    {
        return __('products::filament/resources/product/pages/manage-variants.title');
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Hidden::make('type')
                    ->default('projects'),
                Forms\Components\DatePicker::make('date')
                    ->label(__('products::filament/resources/product/pages/manage-variants.form.date'))
                    ->required()
                    ->native(false),
                Forms\Components\Select::make('user_id')
                    ->label(__('products::filament/resources/product/pages/manage-variants.form.employee'))
                    ->required()
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('name')
                    ->label(__('products::filament/resources/product/pages/manage-variants.form.description')),
                Forms\Components\TextInput::make('unit_amount')
                    ->label(__('products::filament/resources/product/pages/manage-variants.form.time-spent'))
                    ->numeric()
                    ->required()
                    ->minValue(0)
                    ->helperText(__('products::filament/resources/product/pages/manage-variants.form.time-spent-helper-text')),
            ])
            ->columns(1);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('date')
                    ->label(__('products::filament/resources/product/pages/manage-variants.table.columns.date'))
                    ->date('Y-m-d'),
                Tables\Columns\TextColumn::make('user.name')
                    ->label(__('products::filament/resources/product/pages/manage-variants.table.columns.employee')),
                Tables\Columns\TextColumn::make('name')
                    ->label(__('products::filament/resources/product/pages/manage-variants.table.columns.description')),
                Tables\Columns\TextColumn::make('unit_amount')
                    ->label(__('products::filament/resources/product/pages/manage-variants.table.columns.time-spent'))
                    ->formatStateUsing(function ($state) {
                        $hours = floor($state);
                        $minutes = ($hours - $hours) * 60;

                        return $hours.':'.$minutes;
                    }),
            ])
            ->actions([
                Tables\Actions\DeleteAction::make()
                    ->successNotification(
                        Notification::make()
                            ->success()
                            ->title(__('products::filament/resources/product/pages/manage-variants.table.actions.delete.notification.title'))
                            ->body(__('products::filament/resources/product/pages/manage-variants.table.actions.delete.notification.body')),
                    ),
            ])
            ->paginated(false);
    }
}
