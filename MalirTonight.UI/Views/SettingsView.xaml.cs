using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class SettingsView : System.Windows.Controls.UserControl
{
    public SettingsView(SettingsViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
        Loaded += async (_, _) => await viewModel.LoadCommand.ExecuteAsync(null);
    }
}
