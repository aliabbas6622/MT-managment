using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class LeaveListView : System.Windows.Controls.UserControl
{
    public LeaveListView()
    {
        InitializeComponent();
    }

    public LeaveListView(LeaveListViewModel viewModel) : this()
    {
        DataContext = viewModel;
        Loaded += async (_, _) => await viewModel.LoadCommand.ExecuteAsync(null);
    }
}